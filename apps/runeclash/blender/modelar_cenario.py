# Arena das Brasas - pecas de cenario originais, modeladas por codigo no Blender.
# Como usar: no Blender, aba Scripting > Abrir este arquivo > Executar (ou pelo MCP).
# Cria (ou recria) a colecao "PECAS_CENARIO" com uma peca por objeto. Cada peca:
#   - fica em metros, com a base no chao (Z = 0) e o centro em X = Y = 0;
#   - a frente olha para -Y (padrao do Blender; no jogo vira +Z);
#   - usa materiais pelo NOME (o jogo troca a cor de alguns pelo tema da arena):
#       pedra, pedra2, musgo, piso, piso2, folha, tronco, neve, arenito, arenito2, basalto, carvao, ouro, metal
#       gelo...  = translucido no jogo
#       luz...   = brilha sozinho no jogo (fogo, lava, brasas)
# Depois rode exportar_pecas.py para gerar js/arena/pecas_blender.js.
import bpy, bmesh, math, random
from mathutils import Matrix, Vector, Euler

COLECAO = 'PECAS_CENARIO'
CORES = {
    'pedra': (0.55, 0.53, 0.50), 'pedra2': (0.42, 0.40, 0.38), 'musgo': (0.30, 0.45, 0.22), 'piso': (0.61, 0.58, 0.52), 'piso2': (0.52, 0.49, 0.44),
    'folha': (0.22, 0.42, 0.20), 'tronco': (0.40, 0.28, 0.18), 'neve': (0.93, 0.96, 1.0), 'arenito': (0.80, 0.64, 0.42), 'arenito2': (0.70, 0.52, 0.33),
    'basalto': (0.18, 0.16, 0.16), 'carvao': (0.12, 0.10, 0.09), 'ouro': (0.85, 0.66, 0.25), 'metal': (0.35, 0.36, 0.40), 'coco': (0.35, 0.24, 0.12),
    'gelo': (0.62, 0.84, 0.98), 'gelo2': (0.85, 0.95, 1.0),
    'luz_fogo': (1.0, 0.62, 0.18), 'luz_brasa': (1.0, 0.36, 0.10), 'luz_lava': (1.0, 0.40, 0.08), 'luz_cristal': (1.0, 0.82, 0.45),
}

def srgb2lin(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def material(nome):
    m = bpy.data.materials.get(nome)
    if m is None:
        m = bpy.data.materials.new(nome); m.use_nodes = True
    c = tuple(srgb2lin(x) for x in CORES.get(nome, (0.8, 0.8, 0.8)))   # cores da tabela estao em sRGB (as mesmas do jogo)
    m.diffuse_color = (*c, 1.0)
    bsdf = next((n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED'), None)
    if bsdf:
        bsdf.inputs['Base Color'].default_value = (*c, 1.0)
        bsdf.inputs['Roughness'].default_value = 0.85
        if nome.startswith('luz'):
            for k in ('Emission Color', 'Emission'):
                if k in bsdf.inputs: bsdf.inputs[k].default_value = (*c, 1.0); break
            if 'Emission Strength' in bsdf.inputs: bsdf.inputs['Emission Strength'].default_value = 3.0
    return m

def matriz(pos=(0, 0, 0), rot=(0, 0, 0), esc=(1, 1, 1)):
    return Matrix.Translation(Vector(pos)) @ Euler(rot).to_matrix().to_4x4() @ Matrix.Diagonal((*esc, 1.0))

class Peca:
    """Junta primitivas num unico bmesh, cada uma com seu material."""
    def __init__(s, nome, semente=1):
        s.nome, s.bm, s.mats = nome, bmesh.new(), []
        s.r = random.Random(semente)
    def slot(s, m):
        if m not in s.mats: s.mats.append(m)
        return s.mats.index(m)
    def _marca(s, antes, m, bisel=0.0):
        novas = [f for f in s.bm.faces if f not in antes]
        if bisel > 0:
            vs = {v for f in novas for v in f.verts}
            arestas = list({e for f in novas for e in f.edges})
            bmesh.ops.bevel(s.bm, geom=arestas + list(vs), offset=bisel, segments=1, affect='EDGES', clamp_overlap=True)
            novas = [f for f in s.bm.faces if f not in antes]
        i = s.slot(m)
        for f in novas: f.material_index = i
        return novas
    def caixa(s, m, tam, pos=(0, 0, 0), rot=(0, 0, 0), bisel=0.0):
        antes = set(s.bm.faces)
        bmesh.ops.create_cube(s.bm, size=1.0, matrix=matriz(pos, rot, tam))
        return s._marca(antes, m, bisel)
    def cilindro(s, m, r1, r2, h, seg=8, pos=(0, 0, 0), rot=(0, 0, 0), esc=(1, 1, 1)):
        # base em pos, crescendo no eixo Z local
        antes = set(s.bm.faces)
        M = matriz(pos, rot, esc) @ Matrix.Translation((0, 0, h / 2))
        bmesh.ops.create_cone(s.bm, cap_ends=True, cap_tris=False, segments=seg, radius1=r1, radius2=max(r2, 0.0001), depth=h, matrix=M)
        return s._marca(antes, m)
    def esfera(s, m, r, sub=1, pos=(0, 0, 0), esc=(1, 1, 1), ruido=0.0, rot=(0, 0, 0)):
        antes = set(s.bm.faces)
        res = bmesh.ops.create_icosphere(s.bm, subdivisions=sub, radius=r, matrix=Matrix.Identity(4))
        for v in res['verts']: v.co *= 1 + (s.r.random() - 0.5) * 2 * ruido
        bmesh.ops.transform(s.bm, matrix=matriz(pos, rot, esc), verts=res['verts'])
        return s._marca(antes, m)
    def verts_de(s, faces): return list({v for f in faces for v in f.verts})
    def objeto(s, x=0.0):
        me = bpy.data.meshes.new(s.nome)
        bmesh.ops.recalc_face_normals(s.bm, faces=s.bm.faces)
        s.bm.to_mesh(me); s.bm.free()
        for m in s.mats: me.materials.append(material(m))
        for p in me.polygons: p.use_smooth = False
        ob = bpy.data.objects.new(s.nome, me); ob.location.x = x
        bpy.data.collections[COLECAO].objects.link(ob)
        return ob

def aspero(verts, r, forca):
    for v in verts: v.co += Vector(((r.random() - 0.5) * forca, (r.random() - 0.5) * forca, (r.random() - 0.5) * forca))

# ------------------------------------------------------------------ RUINAS
def pilar(quebrado=False, nome='pilar', semente=3):
    P = Peca(nome, semente); r = P.r
    P.caixa('pedra2', (2.2, 2.2, 0.45), (0, 0, 0.225), bisel=0.06)
    P.caixa('pedra', (1.75, 1.75, 0.3), (0, 0, 0.6), bisel=0.05)
    h = 2.6 if quebrado else 5.2
    fuste = P.cilindro('pedra', 0.68, 0.6, h, seg=16, pos=(0, 0, 0.75))
    for v in P.verts_de(fuste):   # caneluras: um vertice sim, outro nao, para dentro
        ang = math.atan2(v.co.y, v.co.x); k = round(ang / (math.pi * 2 / 16))
        if k % 2: v.co.x *= 0.86; v.co.y *= 0.86
        if quebrado and v.co.z > 0.75 + h - 0.01: v.co.z += (r.random() - 0.3) * 0.7   # topo partido
    if quebrado:
        # pedacos caidos ao lado
        P.cilindro('pedra', 0.6, 0.58, 1.1, seg=12, pos=(1.6, 0.4, 0.6), rot=(0, math.pi / 2, 0.4))
        P.caixa('pedra2', (0.5, 0.4, 0.3), (-1.3, -0.9, 0.15), rot=(0.2, 0.1, 0.7), bisel=0.04)
    else:
        P.cilindro('pedra', 0.6, 0.92, 0.35, seg=16, pos=(0, 0, 0.75 + h))
        P.caixa('pedra2', (2.0, 2.0, 0.38), (0, 0, 0.75 + h + 0.54), bisel=0.05)
    for i in range(5):   # musgo nas quinas da base
        a = r.random() * math.tau
        P.caixa('musgo', (0.5 + r.random() * 0.4, 0.3, 0.08), (math.cos(a) * 1.0, math.sin(a) * 1.0, 0.47), rot=(0, 0, a), bisel=0.02)
    return P

def arco_ruina():
    P = Peca('arco_ruina', 5); r = P.r
    for s in (-1, 1):
        P.caixa('pedra2', (1.2, 1.2, 0.4), (s * 2.2, 0, 0.2), bisel=0.05)
        P.caixa('pedra', (0.9, 0.9, 3.2), (s * 2.2, 0, 2.0), bisel=0.04)
    R = 2.2
    for i in range(9):
        if i == 6: continue   # pedra que caiu
        a = math.pi * (i + 0.5) / 9
        P.caixa('pedra' if i % 2 else 'pedra2', (0.9, 0.75, 0.62), (math.cos(a) * R, 0, 3.6 + math.sin(a) * R), rot=(0, -(a - math.pi / 2), 0), bisel=0.04)
    P.caixa('pedra2', (0.8, 0.7, 0.55), (-0.6, 1.1, 0.27), rot=(0.3, 0.2, 0.9), bisel=0.05)
    P.caixa('musgo', (1.0, 0.95, 0.1), (2.2, 0, 3.62), bisel=0.02)
    return P

def pinheiro(nevado=False, nome='pinheiro', semente=7):
    P = Peca(nome, semente); r = P.r
    P.cilindro('tronco', 0.3, 0.16, 2.4, seg=7)
    for k in range(4):
        raio, alto, z = 1.9 - k * 0.42, 2.1 - k * 0.2, 1.3 + k * 1.15
        cone = P.cilindro('folha', raio, 0.0, alto, seg=9, pos=(0, 0, z))
        for v in P.verts_de(cone):
            if v.co.z < z + 0.01:   # borda de baixo: irregular e caida
                f = 0.85 + r.random() * 0.3; v.co.x *= f; v.co.y *= f; v.co.z -= r.random() * 0.35
        if nevado:
            n = P.cilindro('neve', raio * 0.62, 0.0, alto * 0.62, seg=9, pos=(0, 0, z + alto * 0.42))
            for v in P.verts_de(n):
                if v.co.z < z + alto * 0.42 + 0.01: v.co.z -= r.random() * 0.15
    return P

def pedra(nome, semente, esc):
    P = Peca(nome, semente)
    faces = P.esfera('pedra', 1.0, sub=2, esc=esc, ruido=0.22, rot=(0, 0, P.r.random() * 6))
    for v in P.verts_de(faces):
        if v.co.z < 0: v.co.z *= 0.15   # base achatada, encostada no chao
    for f in faces:
        if P.r.random() < 0.35: f.material_index = P.slot('pedra2')
    return P

def braseiro():
    P = Peca('braseiro', 11)
    for i in range(3):
        a = i / 3 * math.tau
        P.caixa('metal', (0.09, 0.09, 1.25), (math.cos(a) * 0.32, math.sin(a) * 0.32, 0.6), rot=(math.sin(a) * 0.32, -math.cos(a) * 0.32, 0))
    P.cilindro('metal', 0.22, 0.62, 0.42, seg=10, pos=(0, 0, 1.1))
    P.cilindro('ouro', 0.64, 0.64, 0.06, seg=10, pos=(0, 0, 1.5))
    for i in range(5):
        a = i / 5 * math.tau
        P.esfera('luz_brasa', 0.16, sub=0, pos=(math.cos(a) * 0.3, math.sin(a) * 0.3, 1.5), ruido=0.2)
    P.cilindro('luz_fogo', 0.36, 0.0, 0.95, seg=6, pos=(0, 0, 1.45))
    P.cilindro('luz_cristal', 0.2, 0.0, 0.65, seg=5, pos=(0.12, 0.08, 1.5), rot=(0.15, -0.1, 0))
    return P

def piso_arena():
    # lajotas em aneis do centro ate a borda da arena (raio 37). Bem finas: o topo fica abaixo de 3 cm,
    # para nao cobrir sombras e avisos que o jogo desenha logo acima do chao.
    P = Peca('piso_arena', 13); r = P.r
    P.cilindro('piso2', 2.0, 2.0, 0.026, seg=24)
    for i in range(16):   # anel fino no centro (emblema), na cor da borda do tema
        a0, a1 = i / 16 * math.tau + 0.03, (i + 1) / 16 * math.tau - 0.03
        pts = [(math.cos(a) * rr, math.sin(a) * rr) for rr, a in ((1.05, a0), (1.05, a1), (1.3, a1), (1.3, a0))]
        vb = [P.bm.verts.new((x, y, 0.0)) for x, y in pts]; vt = [P.bm.verts.new((x, y, 0.029)) for x, y in pts]
        antes = set(P.bm.faces); P.bm.faces.new(vt)
        for k in range(4): P.bm.faces.new((vb[k], vb[(k + 1) % 4], vt[(k + 1) % 4], vt[k]))
        P._marca(antes, 'ouro')
    raio, larg = 2.08, 2.3
    while raio < 37.3:
        r2 = min(raio + larg, 37.4); n = max(8, int(math.tau * (raio + r2) / 2 / 2.4))
        desloc = r.random()
        for i in range(n):
            a0 = (i + desloc) / n * math.tau + 0.012; a1 = (i + 1 + desloc) / n * math.tau - 0.012
            h = 0.016 + r.random() * 0.01
            ri, re = raio + 0.04, r2 - 0.04
            pts = [(math.cos(a) * rr, math.sin(a) * rr) for rr, a in ((ri, a0), (ri, a1), (re, a1), (re, a0))]
            vb = [P.bm.verts.new((x, y, 0.0)) for x, y in pts]
            vt = [P.bm.verts.new((x, y, h)) for x, y in pts]
            antes = set(P.bm.faces)
            P.bm.faces.new(vt)
            for k in range(4): P.bm.faces.new((vb[k], vb[(k + 1) % 4], vt[(k + 1) % 4], vt[k]))
            P._marca(antes, 'piso' if r.random() < 0.72 else 'piso2')
        raio = r2
    # borda da arena: faixa de pedra mais escura
    n = 72
    for i in range(n):
        a0, a1 = i / n * math.tau + 0.004, (i + 1) / n * math.tau - 0.004
        pts = [(math.cos(a) * rr, math.sin(a) * rr) for rr, a in ((37.45, a0), (37.45, a1), (38.4, a1), (38.4, a0))]
        vb = [P.bm.verts.new((x, y, 0.0)) for x, y in pts]; vt = [P.bm.verts.new((x, y, 0.03)) for x, y in pts]
        antes = set(P.bm.faces); P.bm.faces.new(vt)
        for k in range(4): P.bm.faces.new((vb[k], vb[(k + 1) % 4], vt[(k + 1) % 4], vt[k]))
        P._marca(antes, 'pedra2')
    return P

# ------------------------------------------------------------------ DESERTO
def obelisco(quebrado=False, nome='obelisco', semente=17):
    P = Peca(nome, semente); r = P.r
    P.caixa('arenito2', (2.0, 2.0, 0.5), (0, 0, 0.25), bisel=0.05)
    h = 3.2 if quebrado else 7.0
    fuste = P.cilindro('arenito', 0.78, 0.48 if not quebrado else 0.64, h, seg=4, pos=(0, 0, 0.5), rot=(0, 0, math.pi / 4))
    if quebrado:
        for v in P.verts_de(fuste):
            if v.co.z > 0.5 + h - 0.01: v.co.z += (r.random() - 0.4) * 0.9
        P.caixa('arenito', (0.9, 0.7, 2.2), (1.5, 0.6, 0.35), rot=(math.pi / 2 - 0.1, 0, 0.5), bisel=0.03)
    else:
        P.cilindro('ouro', 0.5, 0.0, 0.85, seg=4, pos=(0, 0, 0.5 + h), rot=(0, 0, math.pi / 4))
    for k in range(3 if not quebrado else 1):   # faixas entalhadas
        z = 1.3 + k * 1.9; f = 1 - (z - 0.5) / h * (1 - 0.48 / 0.78)
        P.cilindro('arenito2', 0.81 * f, 0.79 * f, 0.18, seg=4, pos=(0, 0, z), rot=(0, 0, math.pi / 4))
    return P

def palmeira():
    P = Peca('palmeira', 19); r = P.r
    pos, ang, h = Vector((0, 0, 0)), Vector((0.0, 0.0, 1.0)), 0.0
    curva = Vector((0.08, 0.0, 0.0))
    for i in range(8):
        d = (ang + curva * i).normalized(); seg = 0.62
        rot = Vector((0, 0, 1)).rotation_difference(d).to_euler()
        P.cilindro('tronco' if i % 2 == 0 else 'coco', 0.24 - i * 0.012, 0.2 - i * 0.012, seg, seg=7, pos=tuple(pos), rot=tuple(rot))
        pos = pos + d * seg
    topo = pos.copy()
    for i in range(3): P.esfera('coco', 0.14, sub=0, pos=(topo.x + math.cos(i * 2.1) * 0.2, topo.y + math.sin(i * 2.1) * 0.2, topo.z - 0.15))
    for k in range(8):   # folhas: faixas que saem do topo e caem
        a = k / 8 * math.tau + r.random() * 0.3; L = 2.4 + r.random() * 0.6
        dirh = Vector((math.cos(a), math.sin(a), 0)); lado = Vector((-math.sin(a), math.cos(a), 0))
        anterior = None
        for j in range(6):
            t = j / 5; centro = topo + dirh * (L * t) + Vector((0, 0, 0.55 * math.sin(t * 2.2) - 1.3 * t * t))
            w = 0.42 * math.sin(math.pi * min(1, t * 1.1 + 0.08))
            par = (P.bm.verts.new(centro - lado * w), P.bm.verts.new(centro + lado * w))
            if anterior:
                antes = set(P.bm.faces); P.bm.faces.new((anterior[0], anterior[1], par[1], par[0])); P._marca(antes, 'folha')
            anterior = par
    return P

def arco_arenito():
    P = Peca('arco_arenito', 23); r = P.r
    for s in (-1, 1):
        for k in range(4):
            P.caixa('arenito' if k % 2 else 'arenito2', (1.3 - k * 0.08 + r.random() * 0.2, 1.2 + r.random() * 0.2, 0.95), (s * 1.9 + (r.random() - 0.5) * 0.15, (r.random() - 0.5) * 0.15, 0.48 + k * 0.92), rot=(0, 0, r.random() * 0.2), bisel=0.08)
    for k in range(5):
        x = -2.1 + k * 1.05
        P.caixa('arenito2' if k % 2 else 'arenito', (1.2, 1.15 + r.random() * 0.2, 0.9 + r.random() * 0.25), (x, 0, 4.1 + math.sin(k / 4 * math.pi) * 0.35), rot=(0, (r.random() - 0.5) * 0.2, 0), bisel=0.08)
    return P

def rocha_arenito():
    P = Peca('rocha_arenito', 29); r = P.r
    for k in range(3):
        P.caixa('arenito' if k % 2 == 0 else 'arenito2', (2.2 - k * 0.5 + r.random() * 0.3, 1.8 - k * 0.4, 0.55), (r.random() * 0.2, r.random() * 0.2, 0.27 + k * 0.52), rot=(0, 0, r.random() * 0.5), bisel=0.1)
    return P

# ------------------------------------------------------------------ GELEIRA
def cristal_gelo():
    P = Peca('cristal_gelo', 31); r = P.r
    for k in range(6):
        a = k / 6 * math.tau + r.random() * 0.4; inc = 0.15 + r.random() * 0.35 if k else 0.0
        h = (3.4 if k == 0 else 1.4 + r.random() * 1.4); rr = 0.42 if k == 0 else 0.22 + r.random() * 0.12
        base = (math.cos(a) * 0.45 * (k > 0), math.sin(a) * 0.45 * (k > 0), 0)
        rot = (-math.sin(a) * inc, math.cos(a) * inc, 0)
        m = 'gelo' if k % 2 == 0 else 'gelo2'
        P.cilindro(m, rr, rr * 0.9, h, seg=6, pos=base, rot=rot)
        M = matriz(base, rot)
        P.cilindro(m, rr * 0.9, 0.0, rr * 1.6, seg=6, pos=tuple(M @ Vector((0, 0, h))), rot=rot)
    P.esfera('neve', 0.7, sub=1, esc=(1.3, 1.3, 0.3), ruido=0.15)
    return P

# ------------------------------------------------------------------ VULCAO
def espinho_vulcao():
    P = Peca('espinho_vulcao', 37); r = P.r
    f = P.cilindro('basalto', 1.3, 0.12, 6.0, seg=7)
    aspero(P.verts_de(f), r, 0.35)
    for k in range(3):
        a = r.random() * math.tau; z = 0.6 + k * 1.3
        P.esfera('luz_lava', 0.26 - k * 0.04, sub=0, pos=(math.cos(a) * (1.05 - z * 0.17), math.sin(a) * (1.05 - z * 0.17), z), esc=(1, 1, 1.8))
    P.cilindro('luz_lava', 0.2, 0.0, 0.9, seg=6, pos=(0, 0, 5.8))
    P.esfera('basalto', 0.9, sub=0, pos=(1.2, -0.4, 0.2), esc=(1, 0.8, 0.5), ruido=0.2)
    return P

def arvore_queimada():
    P = Peca('arvore_queimada', 41); r = P.r
    t = P.cilindro('carvao', 0.32, 0.1, 3.6, seg=6)
    aspero(P.verts_de(t), r, 0.12)
    for k in range(4):
        a = k / 4 * math.tau + r.random(); z = 1.7 + k * 0.45; inc = 0.7 + r.random() * 0.4
        g = P.cilindro('carvao', 0.1, 0.02, 1.4 + r.random() * 0.5, seg=5, pos=(0, 0, z), rot=(-math.sin(a) * inc, math.cos(a) * inc, 0))
    for k in range(3):
        a = r.random() * math.tau
        P.esfera('luz_brasa', 0.08, sub=0, pos=(math.cos(a) * 0.3, math.sin(a) * 0.3, 0.3 + r.random() * 0.8))
    return P

def rocha_lava():
    P = Peca('rocha_lava', 43)
    faces = P.esfera('basalto', 1.0, sub=2, esc=(1.2, 1.0, 0.75), ruido=0.25)
    for v in P.verts_de(faces):
        if v.co.z < 0: v.co.z *= 0.2
    for f in faces:
        if P.r.random() < 0.18: f.material_index = P.slot('luz_lava')
    return P

def montar():
    col = bpy.data.collections.get(COLECAO)
    if col:
        for ob in list(col.objects): bpy.data.objects.remove(ob, do_unlink=True)
    else:
        col = bpy.data.collections.new(COLECAO); bpy.context.scene.collection.children.link(col)
    for me in [m for m in bpy.data.meshes if m.users == 0]: bpy.data.meshes.remove(me)
    pecas = [pilar(), pilar(True, 'pilar_quebrado', 4), arco_ruina(), pinheiro(), pinheiro(True, 'pinheiro_nevado', 8),
             pedra('pedra_a', 51, (1.0, 0.9, 0.7)), pedra('pedra_b', 52, (1.4, 0.8, 0.55)), pedra('pedra_c', 53, (0.7, 0.7, 0.9)), braseiro(),
             obelisco(), obelisco(True, 'obelisco_quebrado', 18), palmeira(), arco_arenito(), rocha_arenito(),
             cristal_gelo(), espinho_vulcao(), arvore_queimada(), rocha_lava()]
    x = 0.0
    for P in pecas: P.objeto(x); x += 7.0
    pecas_piso = piso_arena(); ob = pecas_piso.objeto(0.0); ob.location = (0, -60, 0)
    return [o.name for o in col.objects]

if __name__ == '__main__':
    print(montar())
