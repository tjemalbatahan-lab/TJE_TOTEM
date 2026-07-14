const form = document.getElementById("formTotem");
const inputId = document.getElementById("totemId");
const inputSenha = document.getElementById("totemSenha");
const btnEntrar = document.getElementById("btnTotemEntrar");
const overlay = document.getElementById("overlayResultado");
const overlayIcone = document.getElementById("overlayIcone");
const overlayTexto = document.getElementById("overlayTexto");

const DURACAO_TELA_MS = 4000;
let processando = false;

function escapeHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

// ===== Sons sintetizados via Web Audio API (sem depender de arquivo externo) =====
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function tocarTom(frequencias, duracaoTotal) {
  const ctx = getAudioCtx();
  const agora = ctx.currentTime;
  const passo = duracaoTotal / frequencias.length;

  frequencias.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, agora + i * passo);

    const inicio = agora + i * passo;
    const fim = inicio + passo * 0.92;
    gain.gain.setValueAtTime(0, inicio);
    gain.gain.linearRampToValueAtTime(0.28, inicio + 0.02);
    gain.gain.linearRampToValueAtTime(0, fim);

    osc.connect(gain).connect(ctx.destination);
    osc.start(inicio);
    osc.stop(fim + 0.02);
  });
}

function tocarSomSucesso() {
  // Duas notas ascendentes, som "positivo"
  tocarTom([659.25, 987.77], 0.42);
}

function tocarSomErro() {
  // Buzzer curto e grave, som de "negado" — mesma altura (ganho) do som de sucesso,
  // com onda senoidal em vez de quadrada pra não soar mais alto que o aprovado.
  const ctx = getAudioCtx();
  const agora = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(180, agora);
  osc.frequency.linearRampToValueAtTime(110, agora + 0.35);
  gain.gain.setValueAtTime(0, agora);
  gain.gain.linearRampToValueAtTime(0.28, agora + 0.02);
  gain.gain.linearRampToValueAtTime(0, agora + 0.4);
  osc.connect(gain).connect(ctx.destination);
  osc.start(agora);
  osc.stop(agora + 0.42);
}

function mostrarOverlay(tipo, nome) {
  overlay.classList.remove("hidden", "overlay-sucesso", "overlay-erro");
  overlay.classList.add(tipo === "sucesso" ? "overlay-sucesso" : "overlay-erro");

  if (tipo === "sucesso") {
    overlayIcone.className = "fa-solid fa-circle-check";
    overlayTexto.innerHTML = nome
      ? `Entrada confirmada<br><span class="overlay-nome">${escapeHtml(nome)}</span>`
      : "Entrada confirmada";
    tocarSomSucesso();
  } else {
    overlayIcone.className = "fa-solid fa-circle-xmark";
    overlayTexto.textContent = "ID ou senha inválidos";
    tocarSomErro();
  }

  requestAnimationFrame(() => overlay.classList.add("overlay-visivel"));
}

function esconderOverlayEResetar() {
  overlay.classList.remove("overlay-visivel");
  setTimeout(() => {
    overlay.classList.add("hidden");
    overlay.classList.remove("overlay-sucesso", "overlay-erro");
  }, 300);

  form.reset();
  btnEntrar.disabled = false;
  btnEntrar.textContent = "Entrar";
  processando = false;
  inputId.focus();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (processando) return;
  processando = true;

  btnEntrar.disabled = true;
  btnEntrar.textContent = "Verificando...";

  const id = inputId.value.trim().toUpperCase();
  const senha = inputSenha.value;
  const emailSintetico = `${id.toLowerCase()}@${DOMINIO_LOGIN}`;

  try {
    const cred = await auth.signInWithEmailAndPassword(emailSintetico, senha);
    const uid = cred.user.uid;

    let nomeCompleto = "";
    try {
      const snap = await db.collection(COL_INSCRICOES).where("authUid", "==", uid).limit(1).get();
      if (!snap.empty) {
        nomeCompleto = snap.docs[0].data().nomeCompleto || "";
      }
    } catch (errBusca) {
      console.error("Falha ao buscar nome do participante:", errBusca);
    }

    // Credenciais corretas: valida e desloga na hora, o totem não guarda sessão.
    await auth.signOut();
    mostrarOverlay("sucesso", nomeCompleto);
  } catch (err) {
    mostrarOverlay("erro");
  }

  setTimeout(esconderOverlayEResetar, DURACAO_TELA_MS);
});

window.addEventListener("load", () => inputId.focus());
