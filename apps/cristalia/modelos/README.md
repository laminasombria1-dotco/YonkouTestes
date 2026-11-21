# Modelos 3D

## brasito.glb

Brasito (raposinha de fogo) feito no Blender. Um arquivo só, 0,7 MB.

- **Malha:** 1 malha com pele (skin), 3.340 faces, 20 ossos (`RaposaFogo_Rig`).
- **Tamanho:** 0,5 m de altura, pés em y = 0. Olha para **+Z** (o padrão do `Object3D.lookAt` do Three.js).
- **Material:** PBR com cor, normal, ORM (oclusão, rugosidade e metal) e `emissiveMap` só nas partes de fogo (ponta do rabo e rachaduras das patas). Texturas 1024 em WebP (`EXT_texture_webp`).
- **Fogo pulsando:** o brilho do Blender era animado; aqui é preciso mexer no `material.emissiveIntensity` no código (ex.: `0.7 + 0.2*sin(t*8.4) + 0.1*sin(t*31)`).

### Animações (24 quadros por segundo)

| Nome | Duração | Repete? | Uso |
|---|---|---|---|
| `Brasito_Parado` | 2,0 s | sim | parado, respirando |
| `Brasito_Arrancada` | 2,5 s | não | sai de parado e acelera até o galope; o último quadro é igual ao 1º de `Brasito_Correndo` |
| `Brasito_Correndo` | 0,42 s | sim | galope |
| `Brasito_Investida` | 0,96 s | não | golpe perto; o osso `root` avança 0,8 m (ignorar se o jogo já move o monstro) |
| `Brasito_LancaChamas` | 1,21 s | não | golpe disparo (jato sai da boca) |
| `Brasito_RaboDeFogo` | 1,04 s | não | golpe área; gira 360° e o rabo cresce 1,7× |
| `Andar` | 1,0 s | sim | andar devagar |
| `Parado_Ansioso` | 2,0 s | sim | parado agitado, com pulinhos |

Carregar com `GLTFLoader` (`three/addons/loaders/GLTFLoader.js`) e tocar com `THREE.AnimationMixer`. Os golpes usam `LoopOnce` com `clampWhenFinished = true`.
