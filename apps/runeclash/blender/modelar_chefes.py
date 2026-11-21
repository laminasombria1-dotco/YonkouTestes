# Arena das Brasas - chefes modelados por codigo no Blender (colecao PECAS_CHEFES).
# Cada peca tem a origem exatamente na "junta" que a animacao do jogo usa (js/modelos.js):
#   Serpe da Tormenta:   dragao de quatro patas: s_corpo, s_pescoco, s_cabeca, s_mandibula (dobradica da boca), s_asa (ombro da asa DIREITA;
#                        a esquerda e espelhada no jogo), s_braco/s_antebraco (pata da frente), s_coxa/s_canela (pata de tras),
#                        s_cauda (cada gomo), s_espinho (cristal da crista da cauda), s_ponta (cristais da ponta da cauda)
#   Sentinela de Geada:  g_nucleo (corpo de gelo e pedra), g_olho (disco aceso do olho), g_ombro (ombro e braco direitos), g_lamina (antebraco:
#                        lamina de gelo), g_estilhaco (cada pedrinha flutuante), g_base (cristais do chao)
#   Arauto das Cinzas:   a_corpo (manto), a_cabeca (capuz), a_braco (ombro direito), a_capa (costas), a_orbe (cada brasa)
#   Cavaleiro Oco:       k_elmo, k_ombreira (ombro direito), k_peito (armadura no tronco), k_montante (espada, na mao)
#   Colosso de Basalto:  c_costas (colunas de basalto nas costas; o resto do Colosso esta em modelar_personagens.py)
# Coordenadas do jogo (Y para cima, frente = +Z); no fim tudo gira para o Blender (Z para cima).
# Materiais pelo nome: "luz..." brilham sozinhos no jogo; "gelo..." ficam translucidos.
# Cada peca ganha uma camada de cor por vertice "cor" (mais escura embaixo e nas partes viradas para baixo,
# com um leve ruido): o jogo multiplica pela cor do material e a peca parece ter volume e textura.
import bpy, bmesh, math, sys, os, random
from mathutils import Vector
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)) if '__file__' in globals() and os.path.isfile(__file__) else os.path.dirname(bpy.data.filepath))
import importlib, modelar_cenario as base, modelar_personagens as pers
importlib.reload(base); importlib.reload(pers)

COLECAO = 'PECAS_CHEFES'
base.CORES.update({
    # Serpe da Tormenta
    'escama': (0.20, 0.38, 0.52), 'escama2': (0.11, 0.22, 0.32), 'ventre': (0.66, 0.80, 0.86), 'membrana': (0.27, 0.50, 0.63), 'chifre': (0.88, 0.89, 0.80),
    'luz_raio': (0.62, 0.93, 1.0),
    # Sentinela de Geada
    'gelo3': (0.55, 0.80, 0.97), 'geada': (0.90, 0.96, 1.0), 'pedra_gelo': (0.36, 0.46, 0.60), 'luz_gelo': (0.78, 0.96, 1.0),
    # Arauto das Cinzas
    'manto': (0.33, 0.11, 0.10), 'manto2': (0.13, 0.06, 0.06), 'borda': (0.62, 0.27, 0.11), 'cinza': (0.46, 0.42, 0.40), 'vazio': (0.03, 0.02, 0.02),
    # Cavaleiro Oco
    'aco': (0.36, 0.38, 0.47), 'aco2': (0.15, 0.16, 0.21), 'bronze': (0.56, 0.42, 0.24), 'luz_alma': (0.80, 0.45, 1.0),
})

class C(pers.Parte):
    def tubo(s, m, pts, seg=8, exp=2.0, fechado=False, tampas=True):
        """tubo que segue uma linha de pontos (x, y, z, raioA[, raioB]); a secao e uma superelipse (exp=2 circulo, 4 quase quadrado)"""
        antes = set(s.bm.faces); P = [Vector(p[:3]) for p in pts]; n = len(P); aneis = []; X = None
        for i in range(n):
            t = (P[(i + 1) % n] - P[i - 1]) if fechado else (P[min(i + 1, n - 1)] - P[max(i - 1, 0)]); t.normalize()
            if X is None:
                up = Vector((0, 1, 0)) if abs(t.y) < 0.9 else Vector((1, 0, 0)); X = up.cross(t).normalized()
            else:
                X = (X - t * X.dot(t)).normalized()   # transporte paralelo: o tubo nao torce
            Y = t.cross(X); ra = max(pts[i][3], 0.002); rb = max(pts[i][4] if len(pts[i]) > 4 else pts[i][3], 0.002); anel = []
            for k in range(seg):
                a = k / seg * math.tau; c, sn = math.cos(a), math.sin(a)
                anel.append(s.bm.verts.new(P[i] + X * (math.copysign(abs(c) ** (2 / exp), c) * ra) + Y * (math.copysign(abs(sn) ** (2 / exp), sn) * rb)))
            aneis.append(anel)
        pares = list(zip(aneis, aneis[1:])) + ([(aneis[-1], aneis[0])] if fechado else [])
        for a, b in pares:
            for k in range(seg): s.bm.faces.new((a[k], a[(k + 1) % seg], b[(k + 1) % seg], b[k]))
        if tampas and not fechado: s.bm.faces.new(list(reversed(aneis[0]))); s.bm.faces.new(aneis[-1])
        return s._marca(antes, m)
    def cristal(s, m, a, b, r, lados=6, ponta=0.3, fundo=0.0):
        """prisma com ponta (e fundo pontudo opcional) de a ate b"""
        A, B = Vector(a), Vector(b); d = B - A
        pts = []
        if fundo > 0: pts.append((*A, 0.003))
        pts += [(*(A + d * (fundo if fundo > 0 else 0)), r * 0.85), (*(A + d * (1 - ponta)), r), (*B, 0.003)]
        return s.tubo(m, pts, seg=lados, exp=2.0)
    def aba(s, m, centro, ang, larg, alt, esp=0.03, abre=0.12):
        """retalho pendurado (barra rasgada de manto ou capa): triangulo grosso preso em cima"""
        antes = set(s.bm.faces); c = Vector(centro); R = Vector((math.sin(ang), 0, math.cos(ang))); T = Vector((math.cos(ang), 0, -math.sin(ang)))
        cima = [c + T * (larg / 2), c - T * (larg / 2)]; bx = c + Vector((0, -alt, 0)) + R * abre
        fo = [s.bm.verts.new(v + R * esp) for v in cima + [bx]]; de = [s.bm.verts.new(v - R * esp) for v in cima + [bx]]
        s.bm.faces.new(fo); s.bm.faces.new(list(reversed(de)))
        for i in range(3): j = (i + 1) % 3; s.bm.faces.new((fo[i], de[i], de[j], fo[j]))
        return s._marca(antes, m)

def sombrear(ob, forca=1.0, semente=1, escamas=0.0):
    """cor por vertice: oclusao simples (mais escuro embaixo e onde a face olha para baixo) + ruido de textura
    (escamas > 0: acrescenta um desenho de manchas regulares, como escamas, mais claras e mais escuras)"""
    me = ob.data; r = random.Random(semente)
    if 'cor' in me.color_attributes: me.color_attributes.remove(me.color_attributes['cor'])
    at = me.color_attributes.new('cor', 'FLOAT_COLOR', 'POINT'); me.update()
    zs = [v.co.z for v in me.vertices]; z0, z1 = min(zs), max(zs); h = max(z1 - z0, 1e-3)
    for v in me.vertices:
        hn = (v.co.z - z0) / h; f = (0.64 + 0.36 * hn) * (0.86 + 0.14 * v.normal.z) * (1 + (r.random() - 0.5) * 0.14)
        if escamas: x, y, z = v.co * 7.0; f *= 1 - escamas * (0.5 + 0.5 * math.sin(x) * math.sin(y + 0.7) * math.sin(z + 1.3))
        f = max(0.25, min(1.0, 1 - (1 - f) * forca)); at.data[v.index].color = (f, f, f, 1.0)
    me.color_attributes.active_color = at

def interp(lista, z):
    """lista de (x, y, z, ra, rb) ao longo de z -> (y, ra, rb) em z"""
    for a, b in zip(lista, lista[1:]):
        if min(a[2], b[2]) <= z <= max(a[2], b[2]):
            k = (z - a[2]) / ((b[2] - a[2]) or 1); return tuple(a[i] + (b[i] - a[i]) * k for i in (1, 3, 4))
    a = lista[0] if abs(z - lista[0][2]) < abs(z - lista[-1][2]) else lista[-1]; return a[1], a[3], a[4]

# ================================================================== SERPE DA TORMENTA (dragao de raios de quatro patas)
# Refeita a partir da folha de referencia: corpo musculoso azul-marinho, ventre em placas claras, crista de cristais,
# chifres claros puxados para tras, asas grandes de membrana clara e translucida, cauda longa com cristais na ponta,
# e veios de raio acesos nas asas, nos chifres, na cauda, nos flancos e nas patas.
# Juntas (usadas por serpeBlender em js/modelos.js), em coordenadas do jogo:
#   corpo (0, 2.35, 0) | pescoco (0, .45, 1.75) no corpo | cabeca (0, 1.55, 1.05) no pescoco | mandibula (0, -.12, .05) na cabeca
#   asa (+-.5, .72, .75) | braco (+-.62, -.25, 1.05) -> antebraco (.06, -.95, -.25) | coxa (+-.66, -.05, -1.25) -> canela (.08, -.85, .45)
#   cauda[0] (0, .05, -1.95), cada gomo seguinte (0, 0, -.8) | ponta (0, 0, -.75) no ultimo gomo | espinho: em cima de cada gomo
#   (a cabeca e a mandibula sao 20% maiores: a dobradica fica em (0, -.144, .06) na cabeca)
# Com o corpo na altura de descanso as garras tocam o chao (y = 0).
base.CORES.update({
    'escama_s': (0.19, 0.36, 0.68), 'escama_s2': (0.08, 0.15, 0.33), 'ventre_s': (0.52, 0.70, 0.90), 'chifre_s': (0.80, 0.87, 0.95),
    'gelo_membrana': (0.64, 0.82, 1.0), 'gelo_crista': (0.62, 0.90, 1.0), 'luz_raio': (0.72, 0.94, 1.0),
})
SERPE = [(0, 0.05, -2.1, 0.46, 0.44), (0, 0.10, -1.6, 0.72, 0.66), (0, 0.10, -1.1, 0.76, 0.7), (0, 0.05, -0.5, 0.7, 0.68),
         (0, 0.02, 0.2, 0.82, 0.82), (0, 0.05, 0.9, 0.92, 0.9), (0, 0.22, 1.5, 0.76, 0.74), (0, 0.42, 1.95, 0.5, 0.5)]

def denso(L, passo=0.15):
    """perfil (x, y, z, ra, rb) reamostrado a cada 'passo' em z (mais aneis = silhueta mais redonda e mais pontos de sombreado)"""
    z0, z1 = L[0][2], L[-1][2]; n = max(2, round((z1 - z0) / passo)); out = []
    for k in range(n + 1):
        z = z0 + (z1 - z0) * k / n; y, ra, rb = interp(L, z); out.append((0, y, z, ra, rb))
    return out

def sup(L, z, ang, fora=0.03):
    """ponto na superficie de um perfil ao longo de z: ang 0 = lado direito, pi/2 = em cima, -pi/2 = embaixo"""
    y, ra, rb = interp(L, z); return Vector((math.cos(ang) * (ra + fora), y + math.sin(ang) * (rb + fora), z))

def lamina(P, m, pts, D, N):
    """cristal/lamina de secao losangular: pts = [(pos, largura em D, espessura em N), ..., (ponta,)]"""
    antes = set(P.bm.faces); D, N = Vector(D).normalized(), Vector(N).normalized(); aneis = []
    for p, w, e in pts[:-1]:
        p = Vector(p); aneis.append([P.bm.verts.new(p + D * w), P.bm.verts.new(p + N * e), P.bm.verts.new(p - D * w), P.bm.verts.new(p - N * e)])
    for a, b in zip(aneis, aneis[1:]):
        for k in range(4): P.bm.faces.new((a[k], a[(k + 1) % 4], b[(k + 1) % 4], b[k]))
    P.bm.faces.new(list(reversed(aneis[0]))); t = P.bm.verts.new(Vector(pts[-1][0]))
    for k in range(4): P.bm.faces.new((aneis[-1][k], aneis[-1][(k + 1) % 4], t))
    return P._marca(antes, m)

def espinho(P, m, b, h, incl=0.5, larg=0.2, esp=0.05, curva=0.15):
    """espinho de cristal da crista, inclinado para tras (incl em radianos) e curvado"""
    b = Vector(b); U = Vector((0, math.cos(incl), -math.sin(incl))); D = Vector((0, math.sin(incl), math.cos(incl)))
    return lamina(P, m, [(b - U * 0.08, larg, esp), (b + U * h * 0.45 - D * h * curva * 0.4, larg * 0.55, esp * 0.75), (b + U * h - D * h * curva,)], D, (1, 0, 0))

def zigue(a, b, n, amp, rr, perp):
    """pontos de a ate b em zigue-zague (como um raio) no sentido perp"""
    a, b, perp = Vector(a), Vector(b), Vector(perp); out = []
    for k in range(n + 1):
        q = a.lerp(b, k / n)
        if 0 < k < n: q = q + perp * amp * (1 if k % 2 else -1) * (0.55 + 0.9 * rr.random())
        out.append(q)
    return out

def raio_veio(P, pts, r=0.022):
    P.tubo('luz_raio', [(*q, r * (1 - 0.55 * k / (len(pts) - 1))) for k, q in enumerate(pts)], seg=4)

def veio_sup(P, L, z0, z1, a0, a1, n, amp, rr, r=0.02, galho=True):
    """veio de raio desenhado na superficie do perfil L (com um galho)"""
    pts = []
    for k in range(n + 1):
        u = k / n; z = z0 + (z1 - z0) * u; ang = a0 + (a1 - a0) * u + ((amp if k % 2 else -amp) * (0.5 + rr.random()) if 0 < k < n else 0)
        pts.append(sup(L, z, ang, 0.035))
    raio_veio(P, pts, r)
    if galho and n > 2:
        k = rr.randint(1, n - 1); z = z0 + (z1 - z0) * k / n; ang = a0 + (a1 - a0) * k / n
        raio_veio(P, [pts[k], sup(L, z + (z1 - z0) / n * 0.8, ang - 0.35, 0.035), sup(L, z + (z1 - z0) / n * 1.3, ang - 0.6, 0.035)], r * 0.7)

def s_corpo():
    P = C('s_corpo', 71); rr = random.Random(11); L = denso(SERPE)
    P.tubo('escama_s', L, seg=18, exp=2.3)
    for i in range(14):   # placas do ventre (claras, como na referencia), sobem pelo peito
        z = -1.55 + i * 0.25; y, ra, rb = interp(SERPE, z); y2, _, rb2 = interp(SERPE, z + 0.1); s = ((y2 - rb2) - (y - rb)) / 0.1
        P.caixa_j('ventre_s', (ra * (0.95 if z < 0.6 else 1.15), 0.1, 0.25), (0, y - rb * 0.95, z), rot=(-math.atan(s), 0, 0), bisel=0.03)
    for k in range(11):   # crista de cristais nas costas: maiores no meio, menores no pescoco e no quadril
        z = 1.65 - k * 0.36; u = k / 10; h = 0.34 + 0.56 * math.sin(math.pi * min(1, u * 1.15))
        espinho(P, 'gelo_crista', sup(SERPE, z, math.pi / 2, -0.06), h, incl=0.55, larg=0.15 + h * 0.24, esp=0.065)
    for sx in (-1, 1):   # veios de raio nos flancos e no lombo
        veio_sup(P, SERPE, 1.4, -1.8, (0.15 if sx > 0 else math.pi - 0.15), (0.35 if sx > 0 else math.pi - 0.35), 9, 0.16, rr)
        veio_sup(P, SERPE, 0.9, -0.6, (-0.45 if sx > 0 else math.pi + 0.45), (-0.2 if sx > 0 else math.pi + 0.2), 6, 0.14, rr, r=0.017)
        veio_sup(P, SERPE, -0.3, -2.0, (0.9 if sx > 0 else math.pi - 0.9), (0.7 if sx > 0 else math.pi - 0.7), 6, 0.12, rr, r=0.016, galho=False)
        for z in (1.1, -1.25):   # escamas grossas (escuras) nas juntas das patas
            P.esfera_j('escama_s2', 1.0, sup(SERPE, z, 0.0 if sx > 0 else math.pi, -0.22), esc=(0.3, 0.38, 0.42), sub=1)
    return P

PESCOCO = [(0, -0.05, -0.25, 0.47, 0.5), (0, 0.28, 0.22, 0.42, 0.43), (0, 0.72, 0.58, 0.36, 0.37), (0, 1.15, 0.86, 0.31, 0.32), (0, 1.5, 1.03, 0.28, 0.29), (0, 1.72, 1.1, 0.26, 0.27)]

def s_pescoco():
    P = C('s_pescoco', 72); rr = random.Random(12); L = PESCOCO
    P.tubo('escama_s', L, seg=14, exp=2.3)
    for a, b in zip(L, L[1:]):
        for u in (0.25, 0.75):
            p = Vector(a[:3]).lerp(Vector(b[:3]), u); t = (Vector(b[:3]) - Vector(a[:3])).normalized(); rb = a[4] + (b[4] - a[4]) * u; ra = a[3] + (b[3] - a[3]) * u
            n = Vector((0, -t.z, t.y))   # lado da garganta
            P.caixa_j('ventre_s', (ra * 0.95, 0.08, 0.24), tuple(p + n * rb * 0.93), rot=(math.atan2(-t.y, t.z), 0, 0), bisel=0.02)
            costas = -n; U = (costas * 0.8 - t * 0.6).normalized(); base_ = p + costas * rb * 0.85; h = 0.18 + 0.1 * u
            lamina(P, 'gelo_crista', [(base_, 0.11, 0.04), (base_ + U * h * 0.5, 0.06, 0.03), (base_ + U * h,)], t, (1, 0, 0))
    for sx in (-1, 1):   # raio subindo pelo pescoco
        pts = [Vector((sx * (q[3] + 0.03), q[1], q[2])) for q in L[:5]]
        raio_veio(P, zigue(pts[0], pts[2], 4, 0.1, rr, (0, 0.6, -0.8)) + zigue(pts[2], pts[4], 3, 0.08, rr, (0, 0.8, -0.6))[1:], 0.018)
    return P

CRANIO = [(0, 0.02, -0.32, 0.24, 0.25), (0, 0.12, 0.0, 0.33, 0.29), (0, 0.12, 0.3, 0.31, 0.24), (0, 0.05, 0.65, 0.24, 0.18), (0, 0.0, 0.95, 0.19, 0.14), (0, -0.02, 1.2, 0.15, 0.11), (0, -0.04, 1.35, 0.08, 0.07)]

def s_cabeca():
    P = C('s_cabeca', 73); rr = random.Random(13)
    P.tubo('escama_s', CRANIO, seg=12, exp=2.8)
    P.tubo('escama_s2', [(0, 0.27, 0.45, 0.07, 0.05), (0, 0.2, 0.85, 0.05, 0.04), (0, 0.12, 1.2, 0.03, 0.02)], seg=5)   # aresta do focinho
    for sx in (-1, 1):
        P.tubo('escama_s2', [(sx * 0.2, 0.31, 0.05, 0.08, 0.06), (sx * 0.27, 0.3, 0.42, 0.075, 0.055), (sx * 0.2, 0.2, 0.72, 0.03, 0.03)], seg=5)   # sobrancelha pesada
        P.esfera_j('luz_raio', 0.08, (sx * 0.29, 0.17, 0.5), esc=(0.5, 0.6, 1.3))                                                            # olho aceso
        chifre = [(sx * 0.15, 0.3, -0.02, 0.1), (sx * 0.24, 0.48, -0.38, 0.085), (sx * 0.31, 0.62, -0.78, 0.06), (sx * 0.34, 0.66, -1.1, 0.035), (sx * 0.33, 0.6, -1.38, 0.004)]
        P.tubo('chifre_s', chifre, seg=7)                                                                                                    # chifre grande, puxado para tras
        P.tubo('chifre_s', [(sx * 0.25, 0.15, -0.08, 0.07), (sx * 0.42, 0.2, -0.42, 0.05), (sx * 0.52, 0.3, -0.75, 0.004)], seg=6)          # chifre de baixo
        P.tubo('chifre_s', [(sx * 0.26, 0.32, 0.25, 0.04), (sx * 0.36, 0.45, 0.02, 0.003)], seg=5)                                          # chifrinho sobre o olho
        for a, b in (((0.3, -0.06, 0.15), (0.48, -0.12, -0.14)), ((0.28, -0.12, 0.36), (0.43, -0.22, 0.12))):                                 # babados da bochecha
            P.tubo('escama_s2', [(sx * a[0], a[1], a[2], 0.05), (sx * b[0], b[1], b[2], 0.003)], seg=4)
        raio_veio(P, zigue((sx * 0.2, 0.42, -0.2), (sx * 0.35, 0.72, -1.15), 5, 0.06, rr, (0, 0.5, 0.5)), 0.02)                              # raio correndo no chifre
        for k in range(5):   # presas de cima
            z = 0.5 + k * 0.17; x = sx * (0.2 - k * 0.025)
            P.tubo('chifre_s', [(x, -0.06, z, 0.032), (x, -0.21, z + 0.03, 0.003)], seg=4)
        P.caixa_j('escama_s2', (0.05, 0.03, 0.06), (sx * 0.07, 0.06, 1.3))                                                                  # narina
    for k in range(3):   # coroa de cristal entre os chifres
        espinho(P, 'gelo_crista', (0, 0.36 - k * 0.04, 0.2 - k * 0.22), 0.3 - k * 0.04, incl=0.9, larg=0.08, esp=0.035)
    bmesh.ops.scale(P.bm, vec=(1.2, 1.2, 1.2), verts=P.bm.verts)   # cabeca grande como na referencia
    return P

def s_mandibula():
    P = C('s_mandibula', 74)
    P.tubo('escama_s', [(0, -0.02, -0.12, 0.24, 0.1), (0, -0.08, 0.4, 0.24, 0.1), (0, -0.08, 0.85, 0.15, 0.07), (0, -0.05, 1.18, 0.09, 0.05)], seg=10, exp=2.4)
    P.tubo('ventre_s', [(0, -0.13, 0.0, 0.16, 0.05), (0, -0.15, 0.5, 0.17, 0.05), (0, -0.11, 0.95, 0.07, 0.03)], seg=8)
    for sx in (-1, 1):
        for k in range(5):
            z = 0.42 + k * 0.17; x = sx * (0.18 - k * 0.022)
            P.tubo('chifre_s', [(x, 0.0, z, 0.028), (x, 0.13, z - 0.02, 0.003)], seg=4)
        P.tubo('escama_s2', [(sx * 0.2, -0.1, 0.1, 0.04), (sx * 0.32, -0.2, -0.12, 0.003)], seg=4)   # espinho do queixo
    bmesh.ops.scale(P.bm, vec=(1.2, 1.2, 1.2), verts=P.bm.verts)
    return P

PLANO_ASA = lambda x, z: 0.06 * x + 0.12 * z + 0.02   # a membrana fica num plano (facil de prender os veios em cima)

def s_asa():
    P = C('s_asa', 75); rr = random.Random(15)
    V = lambda x, z, dy=0.0: Vector((x, PLANO_ASA(x, z) + dy, z))
    S, E, W = V(0, 0), V(1.2, 0.35, 0.12), V(2.4, 0.15, 0.2)
    F = [V(4.9, -0.2), V(4.4, -1.5), V(3.4, -2.3), V(2.1, -2.5)]; B = V(0.15, -1.9)
    def recorte(a, b, puxa=0.3, n=3):   # borda recortada entre dois dedos (a membrana "afunda" para dentro)
        m = a.lerp(b, 0.5); ctrl = m.lerp(W if b is not B else V(1.0, -0.9), puxa); out = []
        for k in range(1, n + 1):
            u = k / (n + 1); q = a.lerp(ctrl, u).lerp(ctrl.lerp(b, u), u); out.append(V(q.x, q.z))
        return out
    contorno = [S, E, W, F[0]]
    for a, b in zip(F + [B], F[1:] + [B]):
        contorno += recorte(a, b, 0.32 if b is not B else 0.25) + [b]
    esp = Vector((0, 0.025, 0)); antes = set(P.bm.faces)
    cima = [P.bm.verts.new(v + esp) for v in contorno]; baixo = [P.bm.verts.new(v - esp) for v in contorno]; n = len(contorno)
    fc = P.bm.faces.new(cima); fb = P.bm.faces.new(list(reversed(baixo)))
    for i in range(n): j = (i + 1) % n; P.bm.faces.new((cima[i], baixo[i], baixo[j], cima[j]))
    bmesh.ops.triangulate(P.bm, faces=[fc, fb], quad_method='BEAUTY', ngon_method='BEAUTY')
    P._marca(antes, 'gelo_membrana')
    P.tubo('escama_s2', [(*S, 0.17), (*S.lerp(E, 0.5), 0.13), (*E, 0.11), (*E.lerp(W, 0.5), 0.1), (*W, 0.09)], seg=8)   # braco da asa
    P.esfera_j('escama_s2', 0.13, tuple(E)); P.esfera_j('escama_s2', 0.11, tuple(W))
    for i, f in enumerate(F):   # dedos escuros e garrinhas claras nas pontas
        meio = W.lerp(f, 0.5) + Vector((0, 0.03, 0)); d = (f - W).normalized()
        P.tubo('escama_s2', [(*W, 0.075 - i * 0.008), (*meio, 0.05 - i * 0.005), (*f, 0.02)], seg=6)
        P.tubo('chifre_s', [(*f, 0.035), (*(f + d * 0.22 + Vector((0, 0.04, 0))), 0.003)], seg=5)
    P.tubo('chifre_s', [(*W, 0.06), (*(W + Vector((0.08, 0.12, 0.3))), 0.04), (*(W + Vector((0.02, 0.05, 0.55))), 0.003)], seg=6)   # garra do pulso
    P.tubo('chifre_s', [(*E, 0.05), (*(E + Vector((-0.05, 0.1, -0.35))), 0.003)], seg=5)                                       # espora do cotovelo
    nrm = Vector((-0.06, 1, -0.12)).normalized()
    for lado in (1, -1):   # raios ramificados na membrana, dos dois lados (como na referencia)
        o = nrm * 0.045 * lado
        for a, b in zip(F, F[1:] + [B]):
            alvo = recorte(a, b, 0.32)[1]; d = (alvo - W); perp = d.cross(nrm).normalized()
            pts = [q + o for q in zigue(W.lerp(alvo, 0.08), alvo.lerp(W, 0.08), 6, 0.13, rr, perp)]; raio_veio(P, pts, 0.024)
            k = rr.randint(2, 4); fim = pts[k] + (a + o - pts[k]) * 0.45; raio_veio(P, zigue(pts[k], fim, 3, 0.08, rr, perp), 0.016)
        for f in F[:3]:   # raio correndo junto do dedo
            perp = (f - W).cross(nrm).normalized(); raio_veio(P, [q + o for q in zigue(W.lerp(f, 0.3) + perp * 0.12, W.lerp(f, 0.92) + perp * 0.1, 5, 0.07, rr, perp)], 0.015)
        perp = (B - E).cross(nrm).normalized(); raio_veio(P, [q + o for q in zigue(E.lerp(B, 0.1), E.lerp(B, 0.85), 5, 0.1, rr, perp)], 0.018)
    return P

def s_braco():   # pata da frente, parte de cima (origem no ombro; o cotovelo fica em (.06, -.95, -.25))
    P = C('s_braco', 78); rr = random.Random(18)
    L = [(0, 0.18, 0.05, 0.42, 0.46), (0.03, -0.2, -0.05, 0.41, 0.44), (0.05, -0.6, -0.17, 0.3, 0.32), (0.06, -0.95, -0.25, 0.23, 0.24)]
    P.tubo('escama_s', L, seg=12, exp=2.2)
    P.esfera_j('escama_s', 1.0, (0.13, -0.15, 0.06), esc=(0.36, 0.52, 0.44), sub=2)   # musculo do ombro
    raio_veio(P, zigue((0.48, 0.0, 0.05), (0.32, -0.85, -0.22), 4, 0.07, rr, (0, 0, 1)), 0.016)
    return P

def garras(P, y, z, n=3, abre=0.1, comp=0.2):
    for g in range(n):
        x = (g - (n - 1) / 2) * abre
        P.tubo('escama_s', [(x, y, z, 0.06), (x * 1.4, y - 0.06, z + comp, 0.045)], seg=6)
        P.tubo('chifre_s', [(x * 1.4, y - 0.05, z + comp, 0.04), (x * 1.6, y - 0.08, z + comp + 0.14, 0.025), (x * 1.7, y - 0.15, z + comp + 0.22, 0.003)], seg=5)

def s_antebraco():   # pata da frente, de baixo (origem no cotovelo); as garras tocam o chao
    P = C('s_antebraco', 79); rr = random.Random(19)
    P.tubo('escama_s', [(0, 0.05, 0, 0.25, 0.26), (0, -0.45, 0.05, 0.21, 0.22), (0, -0.85, 0.12, 0.17, 0.17)], seg=10, exp=2.2)
    P.esfera_j('escama_s', 1.0, (0, -0.98, 0.2), esc=(0.28, 0.14, 0.34), sub=2)
    garras(P, -0.98, 0.34, 3, 0.14, 0.22)
    P.tubo('chifre_s', [(0, 0.0, -0.15, 0.05), (0, 0.05, -0.38, 0.003)], seg=5)                            # espora do cotovelo
    P.tubo('chifre_s', [(-0.12, -0.95, 0.05, 0.03), (-0.17, -1.05, -0.08, 0.003)], seg=4)                  # dedo de tras
    raio_veio(P, zigue((0.24, -0.05, 0.0), (0.17, -0.8, 0.12), 4, 0.06, rr, (0, 0, 1)), 0.014)
    return P

def s_coxa():   # pata de tras, coxa (origem no quadril; o joelho fica em (.08, -.85, .45))
    P = C('s_coxa', 80); rr = random.Random(20)
    P.tubo('escama_s', [(0, 0.24, 0.02, 0.5, 0.6), (0.04, -0.25, 0.2, 0.5, 0.55), (0.07, -0.6, 0.38, 0.34, 0.35), (0.08, -0.85, 0.45, 0.25, 0.25)], seg=12, exp=2.2)
    P.esfera_j('escama_s', 1.0, (0.14, -0.1, 0.0), esc=(0.4, 0.62, 0.58), sub=2)   # musculo da coxa
    raio_veio(P, zigue((0.55, 0.1, -0.1), (0.36, -0.75, 0.42), 5, 0.08, rr, (0, 0.5, 0.8)), 0.017)
    return P

def s_canela():   # pata de tras, de baixo (origem no joelho): canela, calcanhar alto e pe com garras no chao
    P = C('s_canela', 81); rr = random.Random(21)
    P.tubo('escama_s', [(0, 0.03, 0, 0.27, 0.27), (0, -0.3, -0.25, 0.22, 0.23), (0, -0.62, -0.45, 0.18, 0.18), (0, -0.95, -0.38, 0.15, 0.15), (0, -1.25, -0.22, 0.14, 0.14)], seg=10, exp=2.2)
    P.tubo('chifre_s', [(0, -0.62, -0.52, 0.045), (0, -0.55, -0.75, 0.003)], seg=5)                       # espora do calcanhar
    P.esfera_j('escama_s', 1.0, (0, -1.33, -0.05), esc=(0.28, 0.13, 0.38), sub=2)
    garras(P, -1.35, 0.12, 3, 0.14, 0.22)
    raio_veio(P, zigue((0.21, -0.1, -0.12), (0.16, -1.15, -0.28), 5, 0.06, rr, (0, 0.6, 0.8)), 0.014)
    return P

def s_cauda():   # um gomo da cauda (origem na frente do gomo, vai para tras ate z = -.8; o jogo afina os gomos)
    P = C('s_cauda', 76); rr = random.Random(16)
    L = [(0, 0, 0.15, 0.42, 0.4), (0, 0.01, -0.4, 0.4, 0.38), (0, 0, -0.9, 0.38, 0.36)]
    P.tubo('escama_s', L, seg=12, exp=2.3)
    P.caixa_j('ventre_s', (0.42, 0.08, 0.52), (0, -0.36, -0.38), bisel=0.02)
    for sx in (-1, 1):
        raio_veio(P, zigue((sx * 0.42, 0.02, 0.1), (sx * 0.41, 0.03, -0.88), 4, 0.08, rr, (0, 1, 0)), 0.02)
    return P

def s_espinho():   # cristal da crista da cauda (altura 1; o jogo ajusta o tamanho em cada gomo)
    P = C('s_espinho', 82)
    lamina(P, 'gelo_crista', [((0, -0.1, 0.0), 0.3, 0.07), ((0, 0.45, -0.14), 0.17, 0.05), ((0, 1.0, -0.4),)], (0, 0.25, 1), (1, 0, 0))
    return P

def s_ponta():   # ponta da cauda: feixe de laminas de cristal com o miolo aceso
    P = C('s_ponta', 77)
    P.tubo('escama_s', [(0, 0, 0.1, 0.18, 0.17), (0, 0, -0.25, 0.12, 0.12)], seg=8)
    lamina(P, 'gelo_crista', [((0, 0, -0.1), 0.13, 0.06), ((0, 0.06, -0.75), 0.17, 0.06), ((0, 0.16, -1.5),)], (0, 1, 0), (1, 0, 0))
    lamina(P, 'luz_raio', [((0, 0, -0.2), 0.05, 0.025), ((0, 0.05, -0.7), 0.07, 0.025), ((0, 0.12, -1.25),)], (0, 1, 0), (1, 0, 0))
    for ax, ay, comp in ((0.45, 0.6, 0.95), (-0.45, 0.6, 0.95), (0.75, 0.12, 0.75), (-0.75, 0.12, 0.75), (0.18, 1.0, 0.85), (-0.18, 1.0, 0.85), (0.0, -0.45, 0.6)):
        d = Vector((ax, ay, -1.0)).normalized(); b = Vector((ax * 0.05, ay * 0.05, -0.2)); Nn = d.cross(Vector((0, 0, 1)))
        Nn = Nn.normalized() if Nn.length > 1e-3 else Vector((1, 0, 0)); Dd = Nn.cross(d)
        lamina(P, 'gelo_crista', [(b, 0.1, 0.045), (b + d * comp * 0.5, 0.11, 0.04), (b + d * comp * 1.1,)], Dd, Nn)
    return P

# ================================================================== SENTINELA DE GEADA (golem de cristal e pedra)
# Refeita a partir da folha de referencia (frente, lado e 3/4): nucleo alto em forma de ovo facetado, gelo claro e translucido
# com rachaduras brancas em cima e pedra cinza rachada embaixo; olho/portal redondo aceso na frente, numa moldura octogonal de pedra;
# coroa de cristais altos com pedrinhas presas; pedregulho em cada ombro com cristais brotando; braco curto de pedra, junta escura
# e uma lamina de gelo enorme apontando para o chao; cinta hexagonal de pedra escura com escoras para fora e ponta de pedra embaixo;
# sem pernas: flutua sobre um anel de 6 grupos de cristais presos em pedras no chao; pedrinhas flutuando em volta.
# Juntas (usadas por geadaBlender em js/modelos.js), em coordenadas do jogo:
#   corpo (0, 2.6, 0) | olho (0, .45, 1.07) no corpo | braco/ombro (+-1.25, 1.0, 0) no corpo -> ante/cotovelo (.55, -1.0, .05) no braco
#   estilhacos (pedras flutuantes) num anel no corpo | base (0, .5, 0) na raiz (o chao fica em y local -.5)
# Com o corpo na altura de descanso a ponta de baixo fica a .5 do chao e as pontas das laminas a .2.
base.CORES.update({
    'gelo_g': (0.78, 0.91, 1.0), 'gelo_g2': (0.88, 0.97, 1.0), 'rocha_g': (0.56, 0.59, 0.65), 'rocha_g2': (0.31, 0.33, 0.38),
    'luz_olho': (0.58, 0.88, 1.0), 'luz_gelo2': (0.94, 0.99, 1.0),
})
OVO = [(-0.55, 1.9, 1.75), (-0.15, 2.1, 1.95), (0.35, 2.16, 2.0), (0.85, 2.06, 1.92), (1.3, 1.78, 1.66), (1.62, 1.3, 1.2), (1.84, 0.62, 0.58)]

ROCHA_G = [(-1.05, 1.5, 1.45), (-0.7, 2.02, 1.9), (-0.35, 2.2, 2.06), (-0.05, 2.24, 2.1), (0.12, 2.18, 2.04)]

def ovo_r(y, L=OVO):
    """meia largura e meia profundidade do perfil L (ovo de gelo ou pedra de baixo) na altura y"""
    for a, b in zip(L, L[1:]):
        if a[0] <= y <= b[0]: k = (y - a[0]) / (b[0] - a[0]); return (a[1] + (b[1] - a[1]) * k) / 2, (a[2] + (b[2] - a[2]) * k) / 2
    a = L[0] if y < L[0][0] else L[-1]; return a[1] / 2, a[2] / 2

def ovo_pt(y, ang, fora=0.0, L=OVO):
    """ponto na casca do perfil: ang 0 = frente (+z), pi/2 = direita (+x)"""
    w, d = ovo_r(y, L); return Vector((math.sin(ang) * (w + fora), y, math.cos(ang) * (d + fora)))

def rachadura(P, m, pts, r=0.022):
    P.tubo(m, [(*q, r * (1 - 0.6 * k / (len(pts) - 1))) for k, q in enumerate(pts)], seg=3)

def pedra(P, m, r, pos, esc=(1, 1, 1), forca=0.1):
    f = P.esfera_j(m, r, pos, esc=esc, sub=1); base.aspero(P.verts_de(f), P.r, forca * r / 0.3); return f

def g_nucleo():
    P = C('g_nucleo', 81); rr = random.Random(81)
    P.loft('gelo_g', OVO, seg=12, exp=2.0)                                                                                   # ovo de gelo facetado
    P.loft('luz_gelo', [(-0.25, 0.85, 0.8), (0.5, 1.2, 1.12), (1.15, 0.85, 0.8), (1.5, 0.25, 0.25)], seg=8, exp=2.0)          # coracao aceso la dentro
    P.loft('rocha_g', ROCHA_G, seg=9, exp=2.0)                                                                               # metade de baixo: pedra
    for k in range(11):   # pedras quebradas na borda entre a pedra e o gelo (a borda fica irregular, como na referencia)
        a = k / 11 * math.tau + rr.uniform(-0.15, 0.15); y = 0.12 + rr.uniform(-0.05, 0.28); q = ovo_pt(y, a, -0.12)
        if abs(math.remainder(a, math.tau)) < 0.6: continue   # a frente fica livre para a moldura do olho
        pedra(P, 'rocha_g', rr.uniform(0.2, 0.3), tuple(q), (1.25, 0.75, 1.0), 0.09)
    for k in range(5):    # rachaduras escuras na pedra
        a = k / 5 * math.tau + 0.4; y = -0.15; pts = []
        while y > -0.95: pts.append(ovo_pt(y, a, 0.0, ROCHA_G)); y -= rr.uniform(0.15, 0.25); a += rr.uniform(-0.2, 0.2)
        rachadura(P, 'rocha_g2', pts, 0.03)
    for k in range(8):    # rachaduras brancas no gelo
        a = k / 8 * math.tau + rr.uniform(-0.25, 0.25); y = 1.6 - rr.uniform(0, 0.25); pts = []
        while y > 0.2: pts.append(ovo_pt(y, a, -0.005)); y -= rr.uniform(0.17, 0.27); a += rr.uniform(-0.2, 0.2)
        rachadura(P, 'geada', pts, 0.024)
        if len(pts) > 3:
            j = rr.randint(1, len(pts) - 2); yj = pts[j].y; aj = math.atan2(pts[j].x, pts[j].z); s = rr.choice((-1, 1))
            rachadura(P, 'geada', [pts[j], ovo_pt(yj - 0.15, aj + s * 0.25, -0.005), ovo_pt(yj - 0.3, aj + s * 0.42, -0.005)], 0.017)
    # cinta hexagonal de pedra escura, escoras para fora e ponta de pedra embaixo
    P.loft('rocha_g2', [(-1.32, 1.9, 1.9), (-1.1, 2.55, 2.55), (-0.88, 2.42, 2.42), (-0.78, 2.1, 2.1)], seg=6, exp=2.0)
    for k in range(6):
        t = k / 6 * math.tau + math.pi / 6; c, sn = math.cos(t), math.sin(t)                                                  # nos cantos do hexagono
        P.cristal('rocha_g', (c * 1.05, -1.02, sn * 1.05), (c * 1.62, -1.62, sn * 1.62), 0.15, lados=4, ponta=0.45)
        t2 = t + math.pi / 6; c2, s2 = math.cos(t2), math.sin(t2)
        P.cristal('rocha_g2', (c2 * 0.95, -1.15, s2 * 0.95), (c2 * 1.3, -1.55, s2 * 1.3), 0.1, lados=4, ponta=0.5)
    f = P.tubo('rocha_g2', [(0, -1.22, 0, 0.92), (0, -1.55, 0, 0.62), (0, -1.88, 0, 0.27), (0, -2.1, 0, 0.003)], seg=6); base.aspero(P.verts_de(f), P.r, 0.05)
    # olho: soquete de pedra saindo da frente, moldura octogonal e um aro fino de geada (o disco aceso e a peca g_olho)
    P.tubo('rocha_g', [(0, 0.45, 0.55, 0.68), (0, 0.45, 1.03, 0.66)], seg=8)
    cantos = [(math.cos(a) * 0.62, 0.45 + math.sin(a) * 0.62) for a in (k / 8 * math.tau + math.tau / 16 for k in range(8))]
    P.tubo('rocha_g', [(x, y, 1.05, 0.11) for x, y in cantos], seg=4, fechado=True)
    P.tubo('geada', [(math.cos(a) * 0.5, 0.45 + math.sin(a) * 0.5, 1.07, 0.03) for a in (k / 16 * math.tau for k in range(16))], seg=4, fechado=True)
    for x, y in cantos:   # lasquinhas de gelo nos cantos da moldura
        d = Vector((x, y - 0.45, 0)).normalized(); b = Vector((x, y, 1.02))
        P.cristal('gelo_g2', tuple(b - d * 0.02), tuple(b + d * 0.28 + Vector((0, 0, 0.05))), 0.055, lados=4)
    # coroa: muitos cristais altos para cima e para fora, com pedrinhas presas entre eles
    coroa = [(1.42, k / 9 * math.tau + 0.2, 0.62, 0.75 + 0.45 * rr.random(), 0.15) for k in range(9)]
    coroa += [(1.68, k / 5 * math.tau + 0.9, 0.3, 1.0 + 0.35 * rr.random(), 0.17) for k in range(5)]
    for i, (y, a, inc, L, r) in enumerate(coroa):
        w, dd = ovo_r(y); b = Vector((math.sin(a) * w * 0.82, y, math.cos(a) * dd * 0.82)); inc += rr.uniform(-0.08, 0.08)
        d = Vector((math.sin(a) * math.sin(inc), math.cos(inc), math.cos(a) * math.sin(inc)))
        P.cristal('gelo_g2' if i % 2 else 'gelo_g', tuple(b - d * 0.2), tuple(b + d * L), r, lados=6, ponta=0.3)
    P.cristal('gelo_g2', (0, 1.6, 0), (0.05, 3.0, -0.05), 0.21, lados=6, ponta=0.3)
    for k in range(6):
        a = k / 6 * math.tau + 0.55; y = 1.5 + rr.uniform(0, 0.2); q = ovo_pt(y, a, -0.05)
        pedra(P, 'rocha_g', rr.uniform(0.12, 0.17), tuple(q), (1, 0.8, 1), 0.06)
    for sx in (-1, 1):    # cristais nos flancos, perto dos ombros (os ombros ficam em g_ombro)
        P.cristal('gelo_g', (sx * 0.85, 0.75, -0.35), (sx * 1.3, 1.45, -0.7), 0.12, lados=5)
        P.cristal('gelo_g2', (sx * 0.9, 0.2, -0.55), (sx * 1.35, 0.55, -1.1), 0.1, lados=5)
    return P

def g_olho():   # disco aceso do olho com redemoinho (origem no centro, olhando para +z; o jogo gira em z)
    P = C('g_olho', 86)
    P.tubo('luz_olho', [(0, 0, -0.03, 0.52), (0, 0, 0.0, 0.52)], seg=16)
    for k in range(3):
        pts = []
        for i in range(11):
            u = i / 10; ang = k / 3 * math.tau + u * 2.8; r = 0.05 + u * 0.42
            pts.append((math.cos(ang) * r, math.sin(ang) * r, 0.012, 0.05 * (1 - u * 0.65)))
        P.tubo('luz_gelo2', pts, seg=4)
    P.cristal('luz_gelo2', (0, 0, -0.02), (0, 0, 0.12), 0.11, lados=6, ponta=0.5)
    return P

def g_ombro():   # ombro direito (origem na junta do ombro): pedregulho cinza com cristais brotando e o braco curto de pedra ate o cotovelo
    P = C('g_ombro', 85); c = Vector((0.28, 0.12, 0))
    pedra(P, 'rocha_g', 0.6, tuple(c), (1.15, 0.95, 1.05), 0.14)
    pedra(P, 'rocha_g2', 0.38, (0.08, -0.22, 0.04), (1, 1, 1), 0.08)
    for i, (d, L, r) in enumerate([((0.35, 1, 0.15), 0.95, 0.13), ((0.85, 0.6, -0.25), 0.8, 0.11), ((0.2, 0.9, -0.65), 0.75, 0.1),
                                   ((0.75, 0.75, 0.55), 0.7, 0.1), ((1, 0.1, 0.2), 0.55, 0.085), ((0.55, 1, -0.2), 0.6, 0.08), ((0.4, 0.5, 0.9), 0.45, 0.07)]):
        d = Vector(d).normalized(); b = c + Vector((d.x * 0.62, d.y * 0.5, d.z * 0.55))
        P.cristal('gelo_g2' if i % 2 == 0 else 'gelo_g', tuple(b - d * 0.15), tuple(b + d * L), r, lados=5)
    f = P.tubo('rocha_g', [(0.22, -0.2, 0.02, 0.3), (0.42, -0.6, 0.05, 0.31), (0.55, -0.95, 0.05, 0.27)], seg=7); base.aspero(P.verts_de(f), P.r, 0.05)
    return P

def g_lamina():  # antebraco direito (origem no cotovelo): junta de pedra escura e a lamina de gelo enorme ate perto do chao
    P = C('g_lamina', 83)
    f = P.loft('rocha_g2', [(-0.3, 0.58, 0.58), (-0.13, 0.72, 0.72), (0.08, 0.66, 0.66), (0.2, 0.48, 0.48)], seg=6, exp=2.0); base.aspero(P.verts_de(f), P.r, 0.04)
    P.tubo('gelo_g2', [(0.0, -0.2, 0.0, 0.28, 0.38), (0.05, -0.6, 0.04, 0.31, 0.44), (0.12, -1.25, 0.1, 0.26, 0.36), (0.2, -1.85, 0.16, 0.15, 0.2), (0.28, -2.38, 0.22, 0.003)], seg=6)
    P.tubo('luz_gelo', [(0.02, -0.4, 0.02, 0.07), (0.1, -1.2, 0.09, 0.08), (0.2, -1.9, 0.17, 0.04), (0.26, -2.2, 0.2, 0.003)], seg=4)          # veio aceso dentro
    for s in (1, -1):   # arestas de geada da frente e de tras
        rachadura(P, 'geada', [Vector((0.0, -0.3, s * 0.3)), Vector((0.06, -0.8, s * 0.32)), Vector((0.13, -1.35, s * 0.25)), Vector((0.2, -1.9, s * 0.14)), Vector((0.26, -2.3, s * 0.03))], 0.02)
    P.cristal('gelo_g', (0.25, -0.12, 0.1), (0.62, 0.15, 0.25), 0.07, lados=4)
    P.cristal('gelo_g', (0.25, -0.2, -0.15), (0.55, -0.02, -0.45), 0.06, lados=4)
    return P

def g_estilhaco():   # pedrinha flutuante com uma lasca de gelo
    P = C('g_estilhaco', 82)
    pedra(P, 'rocha_g', 0.26, (0, 0, 0), (1.0, 0.8, 0.9), 0.1)
    P.cristal('gelo_g2', (0.0, 0.05, 0), (0.08, 0.58, 0.05), 0.09, lados=5)
    P.cristal('gelo_g', (0.1, 0.0, 0.05), (0.4, 0.22, 0.1), 0.06, lados=4)
    return P

def g_base():   # anel de 6 grupos de cristais presos em pedras escuras no chao (origem a .5 do chao)
    P = C('g_base', 84); rr = random.Random(84)
    for k in range(6):
        a = k / 6 * math.tau + rr.uniform(-0.12, 0.12); r0 = 1.9 + (k % 2) * 0.22; cx, cz = math.sin(a) * r0, math.cos(a) * r0
        pedra(P, 'rocha_g2', 0.42, (cx, -0.43, cz), (1.25, 0.55, 1.1), 0.12)
        pedra(P, 'rocha_g', 0.22, (cx + math.sin(a) * 0.3, -0.33, cz + math.cos(a) * 0.3), (1, 0.7, 1), 0.08)
        for j, (inc, L, r, lado) in enumerate([(0.28, 1.1 + 0.35 * rr.random(), 0.16, 0.0), (0.62, 0.75, 0.11, 0.65), (0.72, 0.6, 0.09, -0.7), (0.5, 0.5, 0.08, math.pi)]):
            d = Vector((math.sin(a + lado) * math.sin(inc), math.cos(inc), math.cos(a + lado) * math.sin(inc))); b = Vector((cx, -0.36, cz))
            P.cristal('gelo_g2' if j == 0 else 'gelo_g', tuple(b - d * 0.1), tuple(b + d * L), r, lados=6 if j == 0 else 5)
    return P

# ================================================================== ARAUTO DAS CINZAS (conjurador de fogo)
ROBE = [(-0.3, 2.15, 2.15), (0.2, 1.95, 1.9), (0.9, 1.55, 1.45), (1.5, 1.2, 1.0), (1.85, 1.05, 0.75), (2.2, 1.2, 0.72), (2.45, 1.05, 0.62)]
def frente_robe(y):
    for a, b in zip(ROBE, ROBE[1:]):
        if a[0] <= y <= b[0]: k = (y - a[0]) / (b[0] - a[0]); return (a[2] + (b[2] - a[2]) * k) / 2
    return ROBE[-1][2] / 2

def a_corpo():
    P = C('a_corpo', 91)
    P.loft('manto', ROBE, seg=16, exp=2.0, tampa_baixo=False)
    P.loft('manto2', [(-0.28, 2.06, 2.06), (0.6, 1.25, 1.2), (1.1, 0.3, 0.3)], seg=16, exp=2.0)                                 # forro escuro (visto por baixo)
    P.loft('borda', [(-0.34, 2.2, 2.2), (-0.12, 2.1, 2.05)], seg=16, exp=2.0)                                                   # barra
    rr = random.Random(9)
    for k in range(16):   # barra rasgada
        a = (k + 0.5) / 16 * math.tau; r = 1.08
        P.aba('manto' if k % 3 else 'manto2', (math.sin(a) * r, -0.3, math.cos(a) * r * 0.99), a, 0.46, 0.25 + rr.random() * 0.3)
    P.tubo('borda', [(0, y, frente_robe(y) + 0.015, 0.17, 0.03) for y in (-0.2, 0.3, 0.9, 1.45)], seg=4, exp=4)                   # faixa na frente
    for y in (0.0, 0.45, 0.9): P.tubo('luz_brasa', [(0, y - 0.09, frente_robe(y) + 0.04, 0.003), (0, y, frente_robe(y) + 0.05, 0.07), (0, y + 0.09, frente_robe(y) + 0.04, 0.003)], seg=4)   # runas acesas
    P.loft('borda', [(1.38, 1.27, 1.06), (1.52, 1.25, 1.03)], seg=16, exp=2.0)                                                  # cinto
    P.esfera_j('luz_brasa', 0.09, (0, 1.45, frente_robe(1.45) + 0.06), esc=(1, 1.2, 0.6))
    P.loft('manto2', [(1.95, 1.55, 0.95), (2.25, 1.6, 1.0), (2.5, 1.2, 0.8), (2.62, 0.6, 0.5)], seg=12, exp=2.0)                 # manto dos ombros
    for sx in (-1, 1):   # ombreiras de osso com espinhos
        f = P.esfera_j('cinza', 0.28, (sx * 0.62, 2.38, 0), esc=(1.2, 0.7, 1.1)); base.aspero(P.verts_de(f), P.r, 0.05)
        for g in range(3):
            P.tubo('cinza', [(sx * (0.5 + g * 0.12), 2.5, -0.1 + g * 0.06, 0.07), (sx * (0.6 + g * 0.18), 2.85 - g * 0.08, -0.2 + g * 0.05, 0.035), (sx * (0.68 + g * 0.25), 3.05 - g * 0.12, -0.35, 0.003)], seg=5)
    P.tubo('luz_brasa', [(0, 1.85, 0.4, 0.003), (0, 2.02, 0.42, 0.12, 0.025), (0, 2.2, 0.38, 0.003)], seg=4)                      # sinal no peito
    return P

def a_cabeca():
    P = C('a_cabeca', 92)
    P.loft('manto', [(-0.12, 0.62, 0.66, 0, -0.05), (0.12, 0.7, 0.72, 0, -0.06), (0.38, 0.62, 0.66, 0, -0.1), (0.6, 0.42, 0.46, 0, -0.2), (0.82, 0.18, 0.22, 0, -0.36), (0.98, 0.02, 0.02, 0, -0.52)], seg=12, exp=2.2)
    P.esfera_j('vazio', 0.22, (0, 0.17, 0.27), esc=(1.0, 1.18, 0.25))                                                          # rosto escuro
    P.tubo('manto2', [(math.sin(a) * 0.25, 0.17 + math.cos(a) * 0.29, 0.29 - 0.02 * abs(math.cos(a)), 0.045) for a in (k / 14 * math.tau for k in range(14))], seg=5, fechado=True)   # borda do capuz
    for sx in (-1, 1):
        P.esfera_j('luz_brasa', 0.045, (sx * 0.085, 0.2, 0.32), esc=(1.5, 0.65, 0.5))                                         # olhos
        P.tubo('cinza', [(sx * 0.28, 0.38, -0.02, 0.06), (sx * 0.46, 0.58, -0.25, 0.04), (sx * 0.5, 0.86, -0.5, 0.003)], seg=5)    # chifres saindo do capuz
    return P

def a_braco():
    P = C('a_braco', 93)
    P.loft('manto', [(-0.85, 0.62, 0.66), (-0.45, 0.48, 0.5), (-0.05, 0.36, 0.4), (0.12, 0.3, 0.34)], seg=10, exp=2.0, tampa_baixo=False)
    P.loft('manto2', [(-0.8, 0.56, 0.6), (-0.6, 0.3, 0.3)], seg=10, exp=2.0)
    P.loft('borda', [(-0.86, 0.64, 0.68), (-0.76, 0.6, 0.64)], seg=10, exp=2.0)
    for k in range(6): a = (k + 0.5) / 6 * math.tau; P.aba('manto', (math.sin(a) * 0.3, -0.84, math.cos(a) * 0.32), a, 0.3, 0.18 + (k % 2) * 0.12, abre=0.06)
    P.esfera_j('cinza', 0.1, (0, -1.0, 0.05), esc=(1, 1.2, 0.7))                                                               # mao de cinza
    for k in range(4):
        x = -0.06 + k * 0.04
        P.tubo('cinza', [(x, -1.06, 0.08, 0.025), (x * 1.3, -1.18, 0.16, 0.02), (x * 1.4, -1.24, 0.24, 0.003)], seg=4)
    P.esfera_j('luz_brasa', 0.1, (0, -1.25, 0.12), sub=1)
    return P

def a_capa():
    P = C('a_capa', 94)
    lin, col, esp = 8, 7, 0.03; rr = random.Random(4)
    def grade(dz):
        g = []
        for i in range(lin):
            y = -i * 0.32; linha = []
            for j in range(col):
                u = j / (col - 1) - 0.5; w = 1.1 + i * 0.07
                y2 = y + (0.18 + rr.random() * 0.1 if (i == lin - 1 and j % 2 == 1) else 0)
                linha.append(P.bm.verts.new((u * w, y2, -abs(u) * 0.2 - i * 0.02 + dz)))
            g.append(linha)
        return g
    estado = rr.getstate(); fora = grade(-esp); rr.setstate(estado); dentro = grade(0.0)
    antes = set(P.bm.faces)
    for i in range(lin - 1):
        for j in range(col - 1):
            a, b, c, d = fora[i][j], fora[i][j + 1], fora[i + 1][j + 1], fora[i + 1][j]; P.bm.faces.new((a, d, c, b))
            a, b, c, d = dentro[i][j], dentro[i][j + 1], dentro[i + 1][j + 1], dentro[i + 1][j]; P.bm.faces.new((a, b, c, d))
    for i in range(lin - 1):
        for j in (0, col - 1): P.bm.faces.new((fora[i][j], fora[i + 1][j], dentro[i + 1][j], dentro[i][j]))
    for j in range(col - 1): P.bm.faces.new((fora[lin - 1][j], fora[lin - 1][j + 1], dentro[lin - 1][j + 1], dentro[lin - 1][j]))
    P._marca(antes, 'manto2')
    for j in range(0, col, 2):   # pontas em brasa
        v = dentro[lin - 1][j].co; P.tubo('luz_brasa', [(v.x, v.y + 0.05, v.z - 0.015, 0.06, 0.02), (v.x, v.y - 0.12, v.z - 0.02, 0.003)], seg=4)
    P.loft('manto', [(-0.05, 1.1, 0.24, 0, 0.06), (0.06, 1.15, 0.26, 0, 0.06)], seg=10)
    return P

def a_orbe():
    P = C('a_orbe', 95)
    P.esfera_j('luz_brasa', 0.16, (0, 0, 0), sub=1)
    P.esfera_j('luz_fogo', 0.09, (0, 0.02, 0), sub=1)
    for k in range(3):
        a = k / 3 * math.tau
        P.cristal('cinza', (math.sin(a) * 0.12, -0.18, math.cos(a) * 0.12), (math.sin(a) * 0.22, 0.24, math.cos(a) * 0.22), 0.05, lados=4, fundo=0.2)
    return P

# ================================================================== CAVALEIRO OCO (pecas por cima do corpo de heroi; o jogo dobra o tamanho)
def k_elmo():
    P = C('k_elmo', 101)
    P.loft('aco', [(-0.04, 0.3, 0.32), (0.06, 0.34, 0.36), (0.22, 0.36, 0.38, 0, 0.01), (0.36, 0.33, 0.35), (0.44, 0.24, 0.26), (0.48, 0.08, 0.1)], seg=12, exp=2.4)
    P.caixa_j('luz_alma', (0.24, 0.035, 0.03), (0, 0.21, 0.186))                                                             # fenda do visor
    P.caixa_j('aco2', (0.04, 0.2, 0.03), (0, 0.1, 0.18), bisel=0.008)
    for k in range(3): P.caixa_j('aco2', (0.022, 0.06, 0.02), (-0.06 + k * 0.06, 0.06, 0.178))                                # respiros
    P.tubo('aco2', [(0, 0.42, 0.16, 0.025, 0.04), (0, 0.52, -0.02, 0.025, 0.07), (0, 0.48, -0.22, 0.02, 0.05)], seg=4)           # crista
    for sx in (-1, 1):
        P.tubo('aco2', [(sx * 0.16, 0.33, 0.0, 0.05), (sx * 0.3, 0.42, 0.03, 0.04), (sx * 0.36, 0.62, 0.07, 0.03), (sx * 0.32, 0.78, 0.13, 0.003)], seg=6)   # chifres
        P.tubo('luz_alma', [(sx * 0.355, 0.66, 0.085, 0.02), (sx * 0.32, 0.78, 0.13, 0.003)], seg=4)
    P.loft('aco2', [(-0.1, 0.27, 0.29), (0.0, 0.3, 0.32)], seg=12, exp=2.4)                                                  # gorjal
    P.loft('bronze', [(0.0, 0.345, 0.365), (0.03, 0.35, 0.37)], seg=12, exp=2.4)
    return P

def k_ombreira():
    P = C('k_ombreira', 102)
    P.loft('aco', [(0.0, 0.36, 0.34, 0.05, 0), (0.1, 0.34, 0.32, 0.05, 0), (0.17, 0.24, 0.24, 0.05, 0), (0.2, 0.08, 0.1, 0.05, 0)], seg=10, exp=2.2)
    P.loft('aco2', [(-0.12, 0.38, 0.35, 0.07, 0), (-0.03, 0.37, 0.34, 0.07, 0)], seg=10, exp=2.2)
    P.loft('aco', [(-0.21, 0.36, 0.33, 0.08, 0), (-0.13, 0.36, 0.33, 0.08, 0)], seg=10, exp=2.2)
    P.loft('bronze', [(-0.01, 0.37, 0.35, 0.05, 0), (0.015, 0.37, 0.35, 0.05, 0)], seg=10, exp=2.2)
    P.tubo('aco2', [(0.1, 0.15, 0, 0.05), (0.15, 0.3, -0.01, 0.03), (0.2, 0.42, -0.03, 0.003)], seg=5)
    return P

def k_peito():
    P = C('k_peito', 103)
    P.loft('aco', [(0.08, 0.47, 0.29, 0, 0.01), (0.3, 0.54, 0.34, 0, 0.02), (0.46, 0.57, 0.34, 0, 0.015), (0.57, 0.5, 0.28)], seg=12, exp=2.4)
    P.caixa_j('aco2', (0.05, 0.42, 0.04), (0, 0.33, 0.175), bisel=0.01)
    P.tubo('luz_alma', [(0, 0.28, 0.2, 0.003), (0, 0.36, 0.205, 0.06, 0.012), (0, 0.44, 0.2, 0.003)], seg=4)
    for x, z, r in ((-0.15, 0.13, -0.2), (0.15, 0.13, 0.2), (0, -0.15, 0)):   # faldas
        P.caixa_j('aco2', (0.2, 0.24, 0.035), (x, -0.08, z), rot=(0.12 if z > 0 else -0.12, r, 0), bisel=0.01)
    return P

def k_montante():
    P = C('k_montante', 104)
    P.tubo('aco', [(0, 0, 0.28, 0.095, 0.03), (0, 0, 1.3, 0.1, 0.03), (0, 0, 2.05, 0.07, 0.025), (0, 0, 2.38, 0.004, 0.004)], seg=4)
    for lado in (1, -1): P.tubo('luz_alma', [(0, lado * 0.03, 0.34, 0.022, 0.006), (0, lado * 0.028, 1.4, 0.024, 0.006), (0, lado * 0.024, 2.0, 0.015, 0.005)], seg=4)
    P.tubo('aco2', [(-0.36, 0, 0.34, 0.035), (-0.22, 0, 0.24, 0.04), (0, 0, 0.21, 0.05), (0.22, 0, 0.24, 0.04), (0.36, 0, 0.34, 0.035)], seg=6)   # guarda
    P.esfera_j('luz_alma', 0.055, (0, 0, 0.22), sub=1)
    P.tubo('aco2', [(0, 0, -0.22, 0.032), (0, 0, 0.2, 0.034)], seg=6)
    for z in (-0.12, 0.02, 0.14): P.tubo('bronze', [(0, 0, z - 0.012, 0.038), (0, 0, z + 0.012, 0.038)], seg=6)
    P.esfera_j('bronze', 0.06, (0, 0, -0.26), sub=1)
    return P

# ================================================================== COLOSSO: colunas de basalto nas costas (silhueta mais marcante)
def c_costas():
    P = C('c_costas', 66)
    for k, (x, h, inc) in enumerate(((-0.9, 0.9, -0.35), (-0.45, 1.25, -0.15), (0.0, 1.5, 0.0), (0.45, 1.2, 0.15), (0.9, 0.85, 0.35))):
        a, b = (x * 0.8, 1.3, -0.45), (x * 1.15 + inc * 0.6, 1.7 + h, -0.95 - h * 0.3)
        f = P.cristal('rocha2', a, b, 0.22 + 0.04 * (k == 2), lados=6, ponta=0.12); base.aspero(P.verts_de(f), P.r, 0.04)
        bb = Vector(b); d = (bb - Vector(a)).normalized()
        P.cristal('luz_nucleo', tuple(bb - d * 0.32), tuple(bb + d * 0.06), 0.12, lados=6, ponta=0.5)
    return P

PECAS = [s_corpo, s_pescoco, s_cabeca, s_mandibula, s_asa, s_braco, s_antebraco, s_coxa, s_canela, s_cauda, s_espinho, s_ponta, g_nucleo, g_olho, g_ombro, g_lamina, g_estilhaco, g_base,
         a_corpo, a_cabeca, a_braco, a_capa, a_orbe, k_elmo, k_ombreira, k_peito, k_montante, c_costas]

def montar():
    col = bpy.data.collections.get(COLECAO)
    if col:
        for ob in list(col.objects): bpy.data.objects.remove(ob, do_unlink=True)
    else:
        col = bpy.data.collections.new(COLECAO); bpy.context.scene.collection.children.link(col)
    base_col = base.COLECAO; base.COLECAO = COLECAO
    try:
        x, linha = 0.0, {'s': -30.0, 'g': -40.0, 'a': -50.0, 'k': -60.0, 'c': -70.0}
        for i, f in enumerate(PECAS):
            P = f(); ob = P.objeto(x); ob.location.y = linha[P.nome[0]]; x += 5.0
            sombrear(ob, 0.35 if P.nome == 's_asa' else 0.7 if P.nome[0] == 'k' else 0.75 if P.nome[0] == 'g' else 0.9, semente=i + 1, escamas=0.22 if P.nome[0] == 's' and P.nome != 's_asa' else 0.0)
    finally:
        base.COLECAO = base_col
    # o Colosso (em PECAS_PERSONAGENS) ganha o mesmo sombreado
    for ob in bpy.data.collections['PECAS_PERSONAGENS'].objects:
        if ob.name.startswith('c_'): sombrear(ob, 0.9, semente=len(ob.name))
    return [o.name for o in col.objects]

def previa():
    """monta os chefes em pose de descanso (colecao PREVIA_CHEFES, so para olhar no Blender; nao e exportada).
    Usa copias ligadas das pecas: mudar a peca muda a previa."""
    col = bpy.data.collections.get('PREVIA_CHEFES')
    if col:
        for ob in list(col.objects): bpy.data.objects.remove(ob, do_unlink=True)
    else:
        col = bpy.data.collections.new('PREVIA_CHEFES'); bpy.context.scene.collection.children.link(col)
    def por(nome, x0, pos, esc=(1, 1, 1), rot=(0, 0, 0)):   # rot = rotacao no jogo (x, y, z)
        ob = bpy.data.objects.new('previa_' + nome, bpy.data.objects[nome].data); col.objects.link(ob)
        x, y, z = pos; ob.location = (x0 + x, 20 - z, y); ob.scale = (esc[0], esc[2], esc[1]); ob.rotation_euler = (rot[0], -rot[2], rot[1])
    # Serpe (dragao de quatro patas, em pe; asas abertas)
    por('s_corpo', 0, (0, 2.35, 0)); por('s_pescoco', 0, (0, 2.8, 1.75)); por('s_cabeca', 0, (0, 4.35, 2.8)); por('s_mandibula', 0, (0, 4.206, 2.86))
    for s in (-1, 1):
        por('s_asa', 0, (s * 0.5, 3.07, 0.75), (s, 1, 1), (0, s * 0.35, s * 0.75)); por('s_braco', 0, (s * 0.62, 2.1, 1.05), (s, 1, 1)); por('s_antebraco', 0, (s * 0.68, 1.15, 0.8), (s, 1, 1))
        por('s_coxa', 0, (s * 0.66, 2.3, -1.25), (s, 1, 1)); por('s_canela', 0, (s * 0.74, 1.45, -0.8), (s, 1, 1))
    for i in range(8):
        k = 1 - 0.085 * i; z = -1.95 - 0.8 * i; y = 2.4 + 0.05 * i
        por('s_cauda', 0, (0, y, z), (k, k, 1)); h = 0.42 + 0.07 * i; por('s_espinho', 0, (0, y + 0.36 * k, z - 0.4), (h, h, h))
    por('s_ponta', 0, (0, 2.4 + 0.4, -1.95 - 0.8 * 7 - 0.75), (0.75, 0.75, 0.75))
    # Geada
    por('g_nucleo', 9, (0, 2.6, 0)); por('g_olho', 9, (0, 3.05, 1.07)); por('g_base', 9, (0, 0.5, 0))
    for i in range(8): a = i / 8 * math.tau + 0.3; k = 1 if i % 2 == 0 else 0.7; por('g_estilhaco', 9, (math.cos(a) * 2.9, 2.7 + math.sin(i * 1.9) * 0.9, math.sin(a) * 2.9), (k, k, k))
    for s in (-1, 1): por('g_ombro', 9, (s * 1.25, 3.6, 0), (s, 1, 1)); por('g_lamina', 9, (s * 1.8, 2.6, 0.05), (s, 1, 1))
    # Arauto
    por('a_corpo', 18, (0, 1.2, 0)); por('a_cabeca', 18, (0, 3.75, 0.05)); por('a_capa', 18, (0, 3.4, -0.34))
    for s in (-1, 1): por('a_braco', 18, (s * 0.85, 3.3, 0.1), (s, 1, 1))
    for i in range(5): a = i / 5 * math.tau; por('a_orbe', 18, (math.cos(a) * 1.9, 2.8 + math.sin(i * 2.3) * 0.4, math.sin(a) * 1.9))
    # Colosso (com as colunas novas nas costas)
    for nome, pos in (('c_tronco', (0, 2.3, 0)), ('c_costas', (0, 2.3, 0)), ('c_cabeca', (0, 4.45, 0.1))): por(nome, 28, pos)
    for s in (-1, 1):
        por('c_braco', 28, (s * 1.75, 3.9, 0), (s, 1, 1)); por('c_ante', 28, (s * 1.75, 2.45, 0), (s, 1, 1)); por('c_perna', 28, (s * 0.7, 2.0, 0), (s, 1, 1))
    return len(col.objects)

if __name__ == '__main__':
    print(montar(), previa())
