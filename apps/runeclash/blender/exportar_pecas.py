# Runeclash (pecas vindas da Arena das Brasas) - exporta as pecas do Blender para o jogo (js/arena/pecas_blender.js).
# Como usar: abra arena_pecas.blend, aba Scripting > Abrir este arquivo > Executar.
# Exporta todos os objetos de malha das colecoes listadas em COLECOES. O nome do objeto vira o nome da peca no jogo.
# - Coordenadas: o Blender usa Z para cima e o jogo Y para cima; a frente da peca (-Y no Blender) vira +Z no jogo.
# - A posicao do objeto no Blender NAO e exportada (serve so para organizar a cena); vale a malha em volta da origem.
# - Modificadores sao aplicados. Cada material vira um grupo; a cor exportada e a mesma que o Blender mostra.
# - Se a malha tiver a camada de cor por vertice "cor" (chefes), ela vai junto (k = 1 byte de claridade por vertice).
import bpy, bmesh, base64, struct, os, json

COLECOES = ['PECAS_CENARIO', 'PECAS_PERSONAGENS', 'PECAS_CHEFES']
# a pasta blender/ e a do proprio script; se o Blender nao souber (rodando pelo editor de texto), usa a pasta do .blend
PASTA = os.path.dirname(os.path.abspath(__file__)) if '__file__' in globals() and os.path.isfile(__file__) else os.path.dirname(bpy.data.filepath)
SAIDA = os.path.join(os.path.dirname(PASTA), 'js', 'arena', 'pecas_blender.js')

def lin2srgb(c):
    return 12.92 * c if c <= 0.0031308 else 1.055 * (c ** (1 / 2.4)) - 0.055

def cor_hex(mat):
    if mat is None: return 0xcccccc
    r, g, b = (max(0, min(1, lin2srgb(x))) for x in mat.diffuse_color[:3])
    return (round(r * 255) << 16) | (round(g * 255) << 8) | round(b * 255)

def exportar_objeto(ob, dg):
    ev = ob.evaluated_get(dg); me = ev.to_mesh()
    bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.triangulate(bm, faces=bm.faces[:]); bm.verts.ensure_lookup_table(); bm.verts.index_update()
    pos = []
    for v in bm.verts: pos += [v.co.x, v.co.z, -v.co.y]
    cam = bm.verts.layers.float_color.get('cor') or bm.verts.layers.color.get('cor')
    clar = bytes(max(0, min(255, round(v[cam][0] * 255))) for v in bm.verts) if cam else None
    por_mat = {}
    for f in bm.faces: por_mat.setdefault(f.material_index, []).extend(v.index for v in f.verts)
    idx, grupos = [], []
    nomes = [(m.name if m else 'sem') for m in me.materials] or ['sem']
    cores = [cor_hex(m) for m in me.materials] or [0xcccccc]
    for mi in sorted(por_mat):
        grupos.append([len(idx), len(por_mat[mi]), min(mi, len(nomes) - 1)]); idx += por_mat[mi]
    nv = len(bm.verts); bm.free(); ev.to_mesh_clear()
    grande = nv > 65535
    b_pos = base64.b64encode(struct.pack('<%df' % len(pos), *pos)).decode()
    b_idx = base64.b64encode(struct.pack(('<%dI' if grande else '<%dH') % len(idx), *idx)).decode()
    d = {'v': b_pos, 'i': b_idx, 'i32': 1 if grande else 0, 'g': grupos, 'm': nomes, 'c': cores}
    if clar: d['k'] = base64.b64encode(clar).decode()
    return d, nv, len(idx) // 3

def exportar():
    dg = bpy.context.evaluated_depsgraph_get(); pecas, resumo = {}, []
    for nc in COLECOES:
        col = bpy.data.collections.get(nc)
        if not col: continue
        for ob in sorted(col.all_objects, key=lambda o: o.name):
            if ob.type != 'MESH' or ob.hide_render: continue
            d, nv, nt = exportar_objeto(ob, dg); pecas[ob.name] = d; resumo.append(f'{ob.name}: {nt} triangulos')
    with open(SAIDA, 'w', encoding='utf8', newline='\n') as f:
        f.write('// GERADO pelo Blender (apps/runeclash/blender/exportar_pecas.py). Nao edite a mao: mude o arena_pecas.blend e exporte de novo.\n')
        f.write('// Cada peca: v = posicoes (Float32, base64), i = indices, g = grupos [inicio, quantidade, material], m = nomes dos materiais, c = cores, k = claridade por vertice (opcional).\n')
        f.write('export const PECAS = ' + json.dumps(pecas, separators=(',', ':')) + ';\n')
    return SAIDA, resumo

if __name__ == '__main__':
    s, r = exportar(); print(s); print('\n'.join(r))
