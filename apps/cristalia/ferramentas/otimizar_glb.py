# Deixa um .glb do Blender pronto para o celular, sem mexer na malha, nos ossos nem nas animações:
#  - texturas PNG/JPG/WebP viram WebP de 512 (ou o tamanho que você pedir)
#  - pesos dos ossos ficam menores (4 bytes por ponto em vez de 16; o glTF aceita sem extensão)
#  - tira o "dois lados" do material (o celular desenha só a frente: mais leve)
#  - zera o metal (sem isso o monstro fica escuro no jogo, que não tem reflexo de ambiente)
#
# Uso (precisa do Python 3 e do Pillow: pip install pillow):
#   python otimizar_glb.py entrada.glb saida.glb [tamanho] [--manter-metal] [--dois-lados]
# Exemplo: python otimizar_glb.py ardentronco_mobile.glb ../modelos/ardentroco.glb 512
import json, struct, sys, io
from PIL import Image

args = [a for a in sys.argv[1:] if not a.startswith('--')]
ent, sai = args[0], args[1]
tam = int(args[2]) if len(args) > 2 else 512
manter_metal = '--manter-metal' in sys.argv
dois_lados = '--dois-lados' in sys.argv

d = open(ent, 'rb').read()
cl, = struct.unpack('<I', d[12:16]); j = json.loads(d[20:20 + cl])
off = 20 + cl; bl, = struct.unpack('<I', d[off:off + 4]); binb = d[off + 8: off + 8 + bl]
def pedaco(bv): return binb[bv.get('byteOffset', 0): bv.get('byteOffset', 0) + bv['byteLength']]
novos = {}

# 1) texturas
for im in j.get('images', []):
    bv = j['bufferViews'][im['bufferView']]; raw = pedaco(bv)
    img = Image.open(io.BytesIO(raw)); antes = img.size
    if max(img.size) > tam: img = img.resize((tam, round(tam * img.size[1] / img.size[0])), Image.LANCZOS)
    buf = io.BytesIO(); img.save(buf, 'WEBP', quality=92, method=6)
    if im.get('mimeType') == 'image/webp' and img.size == antes and len(raw) <= len(buf.getvalue()):
        novos[im['bufferView']] = raw          # já estava bom: não comprime de novo
    else:
        novos[im['bufferView']] = buf.getvalue()
    im['mimeType'] = 'image/webp'
    print(f"  textura {im.get('name')}: {antes} -> {img.size}, {len(raw)//1024} -> {len(novos[im['bufferView']])//1024} KB")
for t in j.get('textures', []):
    if 'source' in t: t.setdefault('extensions', {})['EXT_texture_webp'] = {'source': t.pop('source')}
if j.get('images'):
    for k in ('extensionsUsed', 'extensionsRequired'):
        j[k] = sorted(set(j.get(k, []) + ['EXT_texture_webp']))

# 2) pesos dos ossos (float -> byte 0 a 255, somando sempre 255)
for me in j['meshes']:
    for pr in me['primitives']:
        if 'WEIGHTS_0' not in pr['attributes']: continue
        a = j['accessors'][pr['attributes']['WEIGHTS_0']]
        if a['componentType'] != 5126: continue
        if sum(1 for x in j['accessors'] if x.get('bufferView') == a['bufferView']) != 1: continue
        bv = j['bufferViews'][a['bufferView']]; o = bv.get('byteOffset', 0) + a.get('byteOffset', 0); st = bv.get('byteStride', 16)
        res = bytearray()
        for i in range(a['count']):
            w = struct.unpack('<4f', binb[o + i * st: o + i * st + 16]); s = sum(w) or 1
            q = [round(x / s * 255) for x in w]; q[q.index(max(q))] += 255 - sum(q); res += bytes(q)
        novos[a['bufferView']] = bytes(res); bv.pop('byteStride', None); a.pop('byteOffset', None)
        a['componentType'] = 5121; a['normalized'] = True; a.pop('min', None); a.pop('max', None)

# 3) material
for m in j.get('materials', []):
    if not dois_lados: m.pop('doubleSided', None)
    if not manter_metal:
        pbr = m.setdefault('pbrMetallicRoughness', {})
        if pbr.get('metallicFactor', 1) > 0 and 'metallicRoughnessTexture' not in pbr:
            print(f"  material {m.get('name')}: metal {pbr.get('metallicFactor', 1)} -> 0")
            pbr['metallicFactor'] = 0

# remonta o arquivo (alinhado de 4 em 4 bytes)
out = bytearray()
for k, bv in enumerate(j['bufferViews']):
    dados = novos.get(k) or pedaco(bv)
    while len(out) % 4: out.append(0)
    bv['byteOffset'] = len(out); bv['byteLength'] = len(dados); out += dados
while len(out) % 4: out.append(0)
j['buffers'][0]['byteLength'] = len(out)
js = json.dumps(j, separators=(',', ':')).encode()
while len(js) % 4: js += b' '
total = 12 + 8 + len(js) + 8 + len(out)
open(sai, 'wb').write(struct.pack('<III', 0x46546C67, 2, total) + struct.pack('<II', len(js), 0x4E4F534A) + js
                      + struct.pack('<II', len(out), 0x004E4942) + bytes(out))
print(f'{ent} ({len(d)//1024} KB) -> {sai} ({total//1024} KB)')
