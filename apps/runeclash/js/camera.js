// =============================================================
// CÂMERA EM TERCEIRA PESSOA (órbita)
// A câmera gira em volta de um ponto (o personagem no mapa, o meio da luta na batalha).
//  yaw   = giro para os lados (0 = câmera atrás, olhando para o "norte" do mapa)
//  pitch = altura (ângulo de cima): mais alto vê mais o chão, mais baixo vê o horizonte
//  zoom  = distância (rodinha do mouse)
// Quem usa: mundo.js e batalha.js, com o giro que vem de controles.js.
// =============================================================
import * as THREE from 'three';

const PITCH_MIN = 0.22, PITCH_MAX = 1.3; // ~13° (quase no chão) até ~75° (quase de cima)
const ZOOM_MIN = 0.6, ZOOM_MAX = 1.6;

function lerpAngulo(a, b, k) {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * k;
}

export class CameraOrbita {
  constructor(yaw = 0) {
    this.yaw = yaw;
    this.pitchExtra = 0; // quanto o jogador subiu/desceu a câmera em relação ao padrão
    this.zoom = 1;
    this.voltarPara = null; // ângulo para onde a câmera está voltando (dois toques no controle)
  }

  // Aplica o que o jogador arrastou desde o último quadro
  // atras = ângulo que deixa a câmera atrás do personagem (para os dois toques)
  girar(g, atras, pitchPadrao, dt) {
    if (g.x || g.y) this.voltarPara = null;
    this.yaw -= g.x;                     // arrastar para a direita olha para a direita
    this.pitchExtra += g.y;              // arrastar para baixo sobe a câmera
    const p = pitchPadrao + this.pitchExtra;
    if (p < PITCH_MIN) this.pitchExtra = PITCH_MIN - pitchPadrao;
    if (p > PITCH_MAX) this.pitchExtra = PITCH_MAX - pitchPadrao;
    this.zoom = THREE.MathUtils.clamp(this.zoom + g.zoom, ZOOM_MIN, ZOOM_MAX);
    if (g.centralizar) { this.voltarPara = atras; this.pitchExtra = 0; }
    if (this.voltarPara != null) {
      this.yaw = lerpAngulo(this.yaw, this.voltarPara, 1 - Math.exp(-10 * dt));
      if (Math.abs(lerpAngulo(this.yaw, this.voltarPara, 1) - this.yaw) < 0.01) this.voltarPara = null;
    }
  }

  // Posição da câmera em relação ao ponto que ela olha
  deslocamento(distPadrao, pitchPadrao) {
    const p = THREE.MathUtils.clamp(pitchPadrao + this.pitchExtra, PITCH_MIN, PITCH_MAX);
    const d = distPadrao * this.zoom;
    const h = Math.cos(p) * d;
    return new THREE.Vector3(Math.sin(this.yaw) * h, Math.sin(p) * d, Math.cos(this.yaw) * h);
  }
}
