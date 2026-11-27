// =============================================================
// NUVEM (Firebase): contas com nome + senha e o jogo salvo na internet.
// Conversa direto com o Firebase pela internet (REST), sem a biblioteca
// grande dele, para o jogo continuar leve no celular.
//
// Como funciona a conta: o nome vira um "e-mail de mentira"
// (Lâmina -> lamina@cristalia.jogo). Assim cada nome tem um dono só.
// O jogo salvo fica em jogadores/<uid> no Firestore, como texto (campo "save"),
// com a hora da última gravação ("atualizado"). As regras do Firestore deixam
// cada jogador ler e gravar só o próprio jogo salvo.
//
// A "apiKey" não é secreta: ela só diz qual projeto usar. Quem protege os
// dados são as regras do Firestore.
// =============================================================
export const FIREBASE = {
  apiKey: 'AIzaSyD8jHEI2sECOZzdWQ-4NqOuEid3cH0aMMc',
  projectId: 'cristalia-91fd6',
};
const AUTH = 'https://identitytoolkit.googleapis.com/v1/accounts:';
const RENOVAR = 'https://securetoken.googleapis.com/v1/token?key=';
const DOCS = `https://firestore.googleapis.com/v1/projects/${FIREBASE.projectId}/databases/(default)/documents/jogadores/`;
const DOMINIO = '@cristalia.jogo';
const ESPERA = 12000; // ms: depois disso, desiste (sem internet)

export const NOME_MIN = 2, NOME_MAX = 16, SENHA_MIN = 6;

// "Lâmina Sombria" -> "lamina.sombria" (sem acento, minúsculo): é o que identifica a conta
export function chaveNome(nome) {
  return nome.trim().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, '.');
}

// Devolve o problema do nome (ou null se estiver certo)
export function problemaNome(nome) {
  const n = nome.trim();
  if (n.length < NOME_MIN) return `O nome precisa ter pelo menos ${NOME_MIN} letras.`;
  if (n.length > NOME_MAX) return `O nome pode ter no máximo ${NOME_MAX} letras.`;
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ0-9 _-]+$/.test(n)) return 'Use só letras, números, espaço, - ou _.';
  return null;
}

export class ErroNuvem extends Error {
  constructor(tipo, mensagem) { super(mensagem); this.tipo = tipo; } // tipo: 'rede', 'sessao', 'conta' ou 'outro'
}

const MENSAGENS = {
  EMAIL_EXISTS: ['conta', 'Esse nome já tem dono. Escolha outro (ou toque em Entrar, se a conta é sua).'],
  INVALID_LOGIN_CREDENTIALS: ['conta', 'Nome ou senha errados.'],
  EMAIL_NOT_FOUND: ['conta', 'Nome ou senha errados.'],
  INVALID_PASSWORD: ['conta', 'Nome ou senha errados.'],
  INVALID_EMAIL: ['conta', 'Esse nome não serve. Use só letras, números e espaço.'],
  WEAK_PASSWORD: ['conta', `A senha precisa ter pelo menos ${SENHA_MIN} letras ou números.`],
  TOO_MANY_ATTEMPTS_TRY_LATER: ['conta', 'Muitas tentativas. Espere um pouco e tente de novo.'],
  USER_DISABLED: ['conta', 'Esta conta foi desativada.'],
  TOKEN_EXPIRED: ['sessao', 'Entre de novo com a sua senha.'],
  INVALID_REFRESH_TOKEN: ['sessao', 'Entre de novo com a sua senha.'],
  USER_NOT_FOUND: ['sessao', 'Esta conta não existe mais.'],
  INVALID_ID_TOKEN: ['sessao', 'Entre de novo com a sua senha.'],
};

async function pedir(url, opcoes = {}) {
  let resp;
  try {
    resp = await fetch(url, { ...opcoes, cache: 'no-store', signal: opcoes.keepalive ? undefined : AbortSignal.timeout?.(ESPERA) });
  } catch {
    throw new ErroNuvem('rede', 'Sem conexão com a nuvem.');
  }
  const dados = await resp.json().catch(() => ({}));
  if (resp.ok) return dados;
  if (resp.status === 404) return null;
  const codigo = String(dados?.error?.message || dados?.error?.status || resp.status).split(' ')[0].split(':')[0];
  const [tipo, msg] = MENSAGENS[codigo] || [resp.status === 401 || resp.status === 403 ? 'sessao' : 'outro', `A nuvem respondeu com um erro (${codigo}).`];
  throw new ErroNuvem(tipo, msg);
}

const json = (corpo) => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) });

function sessaoDe(r) {
  return { uid: r.localId || r.user_id, idToken: r.idToken || r.id_token, refreshToken: r.refreshToken || r.refresh_token,
    expira: Date.now() + (Number(r.expiresIn || r.expires_in) || 3600) * 1000 };
}

export async function criarConta(nome, senha) {
  return sessaoDe(await pedir(AUTH + 'signUp?key=' + FIREBASE.apiKey, json({ email: chaveNome(nome) + DOMINIO, password: senha, returnSecureToken: true })));
}

export async function entrar(nome, senha) {
  return sessaoDe(await pedir(AUTH + 'signInWithPassword?key=' + FIREBASE.apiKey, json({ email: chaveNome(nome) + DOMINIO, password: senha, returnSecureToken: true })));
}

// Conta que já entrou neste aparelho: entra de novo sem a senha (com o "refresh token" guardado)
export async function renovar(refreshToken) {
  const r = await pedir(RENOVAR + FIREBASE.apiKey, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(refreshToken),
  });
  return sessaoDe(r);
}

// O jogo salvo de uma conta na nuvem
export class Nuvem {
  constructor(sessao) { this.s = { ...sessao }; }
  get uid() { return this.s.uid; }
  get refreshToken() { return this.s.refreshToken; }

  async token() {
    if (!this.s.idToken || Date.now() > this.s.expira - 60000) {
      const nova = await renovar(this.s.refreshToken);
      this.s = { ...this.s, ...nova };
    }
    return this.s.idToken;
  }

  // { nome, save (texto), atualizado (ms) } ou null se ainda não tem nada na nuvem
  async ler() {
    const doc = await pedir(DOCS + this.uid, { headers: { Authorization: 'Bearer ' + await this.token() } });
    if (!doc?.fields) return null;
    const f = doc.fields;
    return { nome: f.nome?.stringValue || '', save: f.save?.stringValue || '', atualizado: Number(f.atualizado?.integerValue || 0) };
  }

  // keepalive: o envio continua mesmo se o app for fechado logo depois
  async gravar(nome, save, atualizado, keepalive = false) {
    const corpo = JSON.stringify({ fields: { nome: { stringValue: nome }, save: { stringValue: save }, atualizado: { integerValue: String(atualizado) } } });
    await pedir(DOCS + this.uid, {
      method: 'PATCH', keepalive: keepalive && corpo.length < 60000,
      headers: { Authorization: 'Bearer ' + await this.token(), 'Content-Type': 'application/json' }, body: corpo,
    });
  }
}

// Confere a senha do GM sem guardar a senha no código (só a "impressão digital" dela)
const GM_DIGITAL = '0591b59c1bdd9acd2847a202ddd02c3f14f9b5a049a5707c3279c1e967745ed4';
export async function senhaDoGM(senha) {
  if (!crypto?.subtle) return false;
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(senha));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('') === GM_DIGITAL;
}
