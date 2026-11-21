# Arena das Brasas - partes do corpo dos herois (e do Cavaleiro Oco), modeladas por codigo no Blender.
# Cada parte tem a origem exatamente na "junta" usada pela animacao do jogo (js/modelos.js):
#   h_tronco (quadril/tronco), h_cabeca e h_cabeloN (pescoco), h_braco (ombro), h_ante (cotovelo),
#   h_coxa (quadril), h_canela (joelho), h_ombreira (ombro direito; o esquerdo e espelhado no jogo), h_capa (costas).
# As medidas seguem as caixas antigas do jogo, para a animacao continuar encaixando.
# Materiais pelo nome (o jogo troca pelas cores escolhidas na criacao do personagem):
#   pele, roupa, detalhe, cabelo, calca, olho, metal, couro
# O script trabalha em coordenadas do jogo (Y para cima, frente = +Z) e no fim gira tudo para o Blender (Z para cima).
import bpy, bmesh, math, sys, os
from mathutils import Matrix, Vector
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)) if '__file__' in globals() and os.path.isfile(__file__) else os.path.dirname(bpy.data.filepath))
import importlib, modelar_cenario as base
importlib.reload(base)

COLECAO = 'PECAS_PERSONAGENS'
base.CORES.update({'pele': (0.91, 0.72, 0.58), 'roupa': (0.25, 0.42, 0.69), 'detalhe': (0.88, 0.72, 0.38), 'cabelo': (0.23, 0.16, 0.13),
                   'calca': (0.18, 0.20, 0.25), 'olho': (0.11, 0.11, 0.13), 'metal': (0.84, 0.86, 0.90), 'couro': (0.36, 0.25, 0.16), 'branco': (0.95, 0.95, 0.95)})
JOGO_PARA_BLENDER = Matrix.Rotation(math.pi / 2, 4, 'X')   # (x, y, z) do jogo -> (x, -z, y) do Blender

class Parte(base.Peca):
    def anel(s, y, w, d, seg, exp=2.6, ox=0.0, oz=0.0):
        vs = []
        for k in range(seg):
            t = k / seg * math.tau + math.pi / seg
            c, sn = math.cos(t), math.sin(t)
            x = w / 2 * math.copysign(abs(c) ** (2 / exp), c); z = d / 2 * math.copysign(abs(sn) ** (2 / exp), sn)
            vs.append(s.bm.verts.new((x + ox, y, z + oz)))
        return vs
    def loft(s, m, aneis, seg=10, exp=2.6, tampa_baixo=True, tampa_cima=True):
        """aneis = [(y, largura, profundidade[, deslocX, deslocZ]), ...] de baixo para cima"""
        antes = set(s.bm.faces); rings = [s.anel(a[0], max(a[1], 0.002), max(a[2], 0.002), seg, exp, *(a[3:5] if len(a) > 3 else ())) for a in aneis]
        for a, b in zip(rings, rings[1:]):
            for k in range(seg): s.bm.faces.new((a[k], a[(k + 1) % seg], b[(k + 1) % seg], b[k]))
        if tampa_baixo: s.bm.faces.new(list(reversed(rings[0])))
        if tampa_cima: s.bm.faces.new(rings[-1])
        return s._marca(antes, m)
    def caixa_j(s, m, tam, pos, rot=(0, 0, 0), bisel=0.0):   # caixa em coordenadas do jogo
        return s.caixa(m, tam, pos, rot, bisel)
    def esfera_j(s, m, r, pos, esc=(1, 1, 1), sub=1):
        return s.esfera(m, r, sub=sub, pos=pos, esc=esc)
    def objeto(s, x=0.0):
        bmesh.ops.transform(s.bm, matrix=JOGO_PARA_BLENDER, verts=s.bm.verts[:])
        return base.Peca.objeto(s, x)

def tronco():
    P = Parte('h_tronco')
    # torso: cintura fina, peito largo, ombros caidos; um pouco de volume no peito (+Z)
    P.loft('roupa', [(0.02, 0.40, 0.23), (0.12, 0.42, 0.25, 0, 0.005), (0.30, 0.49, 0.29, 0, 0.012), (0.46, 0.52, 0.29, 0, 0.01), (0.56, 0.48, 0.25), (0.62, 0.30, 0.18)], seg=12)
    P.loft('detalhe', [(-0.02, 0.43, 0.26), (0.10, 0.44, 0.27)], seg=12)                    # cinto
    P.caixa_j('metal', (0.09, 0.07, 0.03), (0, 0.04, 0.14), bisel=0.008)                    # fivela
    P.loft('detalhe', [(0.55, 0.36, 0.22), (0.62, 0.32, 0.2), (0.66, 0.2, 0.14)], seg=12, tampa_baixo=False)   # gola
    P.caixa_j('detalhe', (0.07, 0.5, 0.03), (0.0, 0.33, 0.155), rot=(0, 0, 0.55), bisel=0.008)   # alca diagonal no peito
    P.caixa_j('couro', (0.12, 0.12, 0.05), (0.15, 0.14, 0.13), bisel=0.01)                  # bolsinha no cinto
    P.loft('calca', [(-0.10, 0.36, 0.21), (-0.01, 0.41, 0.24)], seg=12)                     # quadril (cobre a juncao com as pernas)
    return P

def cabeca():
    P = Parte('h_cabeca')
    P.loft('pele', [(-0.08, 0.12, 0.12), (0.04, 0.12, 0.12)], seg=8)                          # pescoco
    P.loft('pele', [(0.03, 0.12, 0.13, 0, 0.03), (0.07, 0.22, 0.24, 0, 0.02), (0.14, 0.28, 0.29), (0.22, 0.30, 0.30), (0.30, 0.28, 0.28), (0.35, 0.2, 0.2), (0.37, 0.08, 0.08)], seg=12, exp=2.3)
    for sx in (-1, 1):
        P.caixa_j('branco', (0.056, 0.036, 0.02), (sx * 0.066, 0.2, 0.142), bisel=0.005)       # olho
        P.caixa_j('olho', (0.022, 0.03, 0.02), (sx * 0.06, 0.199, 0.151))                      # pupila
        P.caixa_j('cabelo', (0.08, 0.02, 0.025), (sx * 0.07, 0.245, 0.148), rot=(0, 0, -sx * 0.12))   # sobrancelha
        P.caixa_j('pele', (0.03, 0.08, 0.06), (sx * 0.152, 0.19, -0.01), bisel=0.008)           # orelha
    P.loft('pele', [(0.12, 0.05, 0.03, 0, 0.152), (0.17, 0.04, 0.04, 0, 0.16), (0.2, 0.025, 0.02, 0, 0.152)], seg=6)   # nariz
    P.caixa_j('olho', (0.07, 0.012, 0.01), (0, 0.1, 0.145))                                    # boca
    return P

def casco(P, m, y0=0.2, esc=1.08, ate_tras=0.1):
    """cabelo colado no cranio: casca um pouco maior que a cabeca, descendo mais atras"""
    P.loft(m, [(y0, 0.30 * esc, 0.30 * esc, 0, -0.03), (0.30, 0.29 * esc, 0.29 * esc, 0, -0.01), (0.36, 0.22 * esc, 0.22 * esc), (0.395, 0.1, 0.1)], seg=12, exp=2.3)
    P.loft(m, [(ate_tras, 0.30, 0.1, 0, -0.13), (y0 + 0.02, 0.32, 0.16, 0, -0.1)], seg=10)   # nuca

def cabelos():
    pecas = []
    P = Parte('h_cabelo0'); casco(P, 'cabelo'); P.caixa_j('cabelo', (0.26, 0.06, 0.06), (0.02, 0.31, 0.14), rot=(0.4, 0, -0.15), bisel=0.01); pecas.append(P)   # curto com franja
    P = Parte('h_cabelo1'); casco(P, 'cabelo', ate_tras=-0.14)                                                                                                    # longo
    P.loft('cabelo', [(-0.16, 0.30, 0.08, 0, -0.15), (0.05, 0.34, 0.12, 0, -0.14), (0.25, 0.32, 0.14, 0, -0.1)], seg=10)
    for sx in (-1, 1): P.loft('cabelo', [(0.0, 0.07, 0.12, sx * 0.165, 0.0), (0.3, 0.07, 0.2, sx * 0.16, -0.02)], seg=6)
    pecas.append(P)
    P = Parte('h_cabelo2'); casco(P, 'cabelo')                                                                                                                    # espetado
    for k in range(7):
        a = -0.9 + k * 0.3; x, z = math.sin(a) * 0.1, -0.03 + math.cos(a * 2) * 0.05
        P.loft('cabelo', [(0.34, 0.09, 0.09, x, z), (0.5 + (k % 2) * 0.05, 0.005, 0.005, x * 1.6, z - 0.04)], seg=5)
    pecas.append(P)
    P = Parte('h_cabelo3'); casco(P, 'cabelo')                                                                                                                    # rabo de cavalo
    P.esfera_j('cabelo', 0.075, (0, 0.38, -0.13))
    P.loft('cabelo', [(-0.12, 0.02, 0.02, 0, -0.27), (0.05, 0.08, 0.08, 0, -0.23), (0.3, 0.1, 0.1, 0, -0.18), (0.38, 0.06, 0.06, 0, -0.15)], seg=7)
    P.caixa_j('detalhe', (0.11, 0.04, 0.11), (0, 0.33, -0.165), bisel=0.01); pecas.append(P)
    P = Parte('h_cabelo4'); casco(P, 'cabelo')                                                                                                                    # dois coques
    for sx in (-1, 1): P.esfera_j('cabelo', 0.085, (sx * 0.16, 0.4, -0.05)); P.loft('detalhe', [(0.33, 0.1, 0.1, sx * 0.15, -0.05), (0.35, 0.1, 0.1, sx * 0.15, -0.05)], seg=8)
    pecas.append(P)
    P = Parte('h_cabelo5'); casco(P, 'cabelo', y0=0.18, ate_tras=0.05)                                                                                          # chapeu de abas largas
    P.loft('detalhe', [(0.31, 0.6, 0.6, 0, 0.01), (0.335, 0.62, 0.62, 0, 0.01), (0.345, 0.34, 0.34), (0.48, 0.28, 0.27), (0.52, 0.22, 0.2)], seg=14, exp=2.0)
    P.loft('roupa', [(0.35, 0.345, 0.345), (0.4, 0.33, 0.33)], seg=14, exp=2.0); pecas.append(P)
    return pecas

def braco():
    P = Parte('h_braco')
    P.esfera_j('detalhe', 0.11, (0, 0.0, 0), esc=(1, 0.9, 1))                                    # ombro
    P.loft('roupa', [(-0.33, 0.12, 0.12), (-0.2, 0.14, 0.14), (-0.02, 0.16, 0.16)], seg=9)       # braco (manga)
    P.loft('detalhe', [(-0.33, 0.135, 0.135), (-0.28, 0.14, 0.14)], seg=9)                       # punho da manga
    return P

def ante():
    P = Parte('h_ante')
    P.loft('pele', [(-0.29, 0.1, 0.1), (-0.12, 0.12, 0.12), (0.01, 0.12, 0.12)], seg=9)          # antebraco
    P.loft('couro', [(-0.27, 0.13, 0.13), (-0.04, 0.15, 0.15)], seg=9)                           # bracadeira
    P.loft('detalhe', [(-0.12, 0.155, 0.155), (-0.09, 0.155, 0.155)], seg=9)
    P.loft('pele', [(-0.39, 0.09, 0.05, 0, 0.012), (-0.33, 0.11, 0.1, 0, 0.01), (-0.28, 0.1, 0.09)], seg=8)   # mao fechada
    P.caixa_j('pele', (0.04, 0.07, 0.05), (0.0, -0.32, 0.06), rot=(0.4, 0, 0), bisel=0.008)      # polegar
    return P

def coxa():
    P = Parte('h_coxa')
    P.loft('calca', [(-0.46, 0.14, 0.15), (-0.25, 0.17, 0.18), (0.0, 0.2, 0.21)], seg=10)
    return P

def canela():
    P = Parte('h_canela')
    P.loft('calca', [(-0.3, 0.13, 0.13), (-0.15, 0.15, 0.16), (0.01, 0.15, 0.16)], seg=10)
    # bota: cano, peito do pe e bico para a frente
    P.loft('detalhe', [(-0.48, 0.17, 0.27, 0, 0.045), (-0.42, 0.18, 0.28, 0, 0.045), (-0.36, 0.16, 0.18, 0, 0.0), (-0.22, 0.165, 0.175)], seg=10, exp=2.4)
    P.loft('couro', [(-0.24, 0.175, 0.185), (-0.2, 0.175, 0.185)], seg=10)
    P.caixa_j('couro', (0.18, 0.025, 0.29), (0, -0.475, 0.045), bisel=0.008)                     # sola
    return P

def ombreira():
    P = Parte('h_ombreira')
    P.loft('detalhe', [(0.0, 0.25, 0.23, 0.03, 0), (0.07, 0.235, 0.225, 0.03, 0), (0.115, 0.17, 0.17, 0.035, 0), (0.14, 0.06, 0.07, 0.04, 0)], seg=10, exp=2.2)
    P.loft('metal', [(-0.01, 0.255, 0.235, 0.03, 0), (0.015, 0.26, 0.24, 0.03, 0)], seg=10, exp=2.2)
    P.esfera_j('metal', 0.02, (0.04, 0.15, 0))
    return P

def capa():
    P = Parte('h_capa')
    # painel curvo que desce pelas costas; a ponta de baixo tem recortes
    lin, col, esp = 6, 5, 0.025
    def grade(dz):
        g = []
        for i in range(lin):
            y = -i * 0.19; linha = []
            for j in range(col):
                u = j / (col - 1) - 0.5; w = 0.5 + i * 0.03
                y2 = y + 0.08 if (i == lin - 1 and j % 2 == 1) else y
                linha.append(P.bm.verts.new((u * w, y2, -abs(u) * 0.08 - i * 0.012 + dz)))
            g.append(linha)
        return g
    fora, dentro = grade(-esp), grade(0.0)   # duas camadas: a capa tem espessura e aparece dos dois lados
    antes = set(P.bm.faces)
    for i in range(lin - 1):
        for j in range(col - 1):
            a, b, c, d = fora[i][j], fora[i][j + 1], fora[i + 1][j + 1], fora[i + 1][j]; P.bm.faces.new((a, d, c, b))
            a, b, c, d = dentro[i][j], dentro[i][j + 1], dentro[i + 1][j + 1], dentro[i + 1][j]; P.bm.faces.new((a, b, c, d))
    for i in range(lin - 1):
        for j in (0, col - 1): P.bm.faces.new((fora[i][j], fora[i + 1][j], dentro[i + 1][j], dentro[i][j]))
    for j in range(col - 1): P.bm.faces.new((fora[lin - 1][j], fora[lin - 1][j + 1], dentro[lin - 1][j + 1], dentro[lin - 1][j]))
    P._marca(antes, 'detalhe')
    P.loft('detalhe', [(-0.03, 0.56, 0.12, 0, 0.05), (0.04, 0.6, 0.14, 0, 0.05)], seg=10)       # dobra no alto
    return P

# ------------------------------------------------------------------ Colosso de Basalto (chefe): golem de rocha com magma por dentro
# Juntas iguais as de colosso() em js/modelos.js. Pecas dos membros sao do lado direito; o jogo espelha o esquerdo.
base.CORES.update({'rocha': (0.46, 0.44, 0.49), 'rocha2': (0.34, 0.33, 0.37), 'luz_nucleo': (1.0, 0.54, 0.17)})

def rochoso(P, faces, forca=0.1):
    base.aspero(P.verts_de(faces), P.r, forca)

def c_tronco():
    P = Parte('c_tronco', 61)
    f = P.loft('rocha', [(-0.75, 1.8, 1.25), (0.2, 2.35, 1.5), (1.2, 2.7, 1.68), (1.85, 2.95, 1.7), (2.15, 2.1, 1.25)], seg=10, exp=2.0); rochoso(P, f, 0.12)
    for sx in (-1, 1):
        f = P.caixa_j('rocha2', (1.15, 0.85, 1.45), (sx * 1.35, 1.85, 0), rot=(0.1, 0.2 * sx, 0.15 * sx), bisel=0.12); rochoso(P, f, 0.06)
        P.caixa_j('musgo', (0.7, 0.08, 0.6), (sx * 1.35, 2.3, -0.1), rot=(0.1, 0.2 * sx, 0.15 * sx), bisel=0.03)
        f = P.caixa_j('rocha2', (0.75, 0.9, 0.35), (sx * 0.72, 0.95, 0.75), rot=(0, -0.2 * sx, 0.1 * sx), bisel=0.08); rochoso(P, f, 0.05)   # placas do peito
    f = P.caixa_j('rocha2', (1.2, 0.5, 0.3), (0, 0.15, 0.7), bisel=0.08); rochoso(P, f, 0.05)
    for k in range(5):   # rachaduras de magma saindo do nucleo
        a = -0.3 + k * 0.7; L = 0.55 + (k % 2) * 0.25
        P.caixa_j('luz_nucleo', (0.07, L, 0.05), (math.sin(a) * (0.35 + L / 2), 0.9 + math.cos(a) * (0.35 + L / 2), 0.84), rot=(0, 0, -a))
    P.loft('luz_nucleo', [(0.55, 0.75, 0.2, 0, 0.74), (1.25, 0.75, 0.2, 0, 0.74)], seg=6)   # brilho atras do nucleo
    return P

def c_cabeca():
    P = Parte('c_cabeca', 62)
    f = P.loft('rocha', [(-0.05, 0.75, 0.75), (0.4, 0.95, 0.9), (0.75, 0.8, 0.8), (0.85, 0.45, 0.5)], seg=8, exp=2.0); rochoso(P, f, 0.07)
    P.caixa_j('rocha2', (1.05, 0.18, 0.35), (0, 0.5, 0.33), rot=(0.15, 0, 0), bisel=0.05)           # testa saliente
    P.caixa_j('luz_nucleo', (0.62, 0.09, 0.06), (0, 0.36, 0.45))                                 # olhos
    f = P.caixa_j('rocha2', (0.7, 0.25, 0.45), (0, 0.05, 0.25), bisel=0.06); rochoso(P, f, 0.04)   # queixo
    return P

def c_braco():
    P = Parte('c_braco', 63)
    f = P.esfera_j('rocha2', 0.55, (0.05, 0.0, 0), esc=(1, 0.9, 1)); rochoso(P, f, 0.08)
    f = P.loft('rocha', [(-1.45, 0.72, 0.72), (-0.7, 0.85, 0.82), (-0.1, 0.8, 0.8)], seg=8, exp=2.0); rochoso(P, f, 0.08)
    P.caixa_j('luz_nucleo', (0.06, 0.9, 0.05), (0.0, -0.75, 0.42))
    return P

def c_ante():
    P = Parte('c_ante', 64)
    f = P.loft('rocha2', [(-1.15, 0.95, 0.95), (-0.5, 1.0, 0.98), (0.0, 0.85, 0.85)], seg=8, exp=2.0); rochoso(P, f, 0.08)
    P.loft('luz_nucleo', [(-0.66, 1.02, 1.0), (-0.58, 1.02, 1.0)], seg=8, exp=2.0)              # anel de magma
    f = P.caixa_j('rocha', (1.2, 0.8, 1.2), (0, -1.45, 0.02), bisel=0.14); rochoso(P, f, 0.06)  # punho
    for k in range(4): P.caixa_j('rocha2', (0.26, 0.24, 0.3), (-0.42 + k * 0.28, -1.72, 0.48), bisel=0.05)   # nos dos dedos
    return P

def c_perna():
    P = Parte('c_perna', 65)
    f = P.loft('rocha2', [(-1.05, 0.85, 0.85), (-0.5, 0.95, 0.95), (0.05, 0.9, 0.9)], seg=8, exp=2.0); rochoso(P, f, 0.07)
    f = P.caixa_j('rocha', (1.1, 0.95, 1.3), (0, -1.5, 0.08), bisel=0.12); rochoso(P, f, 0.06)
    for k in range(3): P.caixa_j('rocha2', (0.3, 0.3, 0.32), (-0.34 + k * 0.34, -1.83, 0.7), bisel=0.05)
    P.loft('luz_nucleo', [(-0.62, 0.97, 0.97), (-0.55, 0.97, 0.97)], seg=8, exp=2.0)
    return P

def montar():
    col = bpy.data.collections.get(COLECAO)
    if col:
        for ob in list(col.objects): bpy.data.objects.remove(ob, do_unlink=True)
    else:
        col = bpy.data.collections.new(COLECAO); bpy.context.scene.collection.children.link(col)
    base_col = base.COLECAO; base.COLECAO = COLECAO   # Peca.objeto liga na colecao configurada
    try:
        pecas = [tronco(), cabeca(), braco(), ante(), coxa(), canela(), ombreira(), capa()] + cabelos() + [c_tronco(), c_cabeca(), c_braco(), c_ante(), c_perna()]
        x = 0.0
        for P in pecas: ob = P.objeto(x); ob.location.y = -20.0; x += 0.9 if P.nome.startswith('h_') else 3.5
    finally:
        base.COLECAO = base_col
    return [o.name for o in col.objects]

if __name__ == '__main__':
    print(montar())
