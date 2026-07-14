const firebaseConfig = {
  apiKey: "AIzaSyDPOygyRai5v9qN7f8gUApjhgHjwLAxV2k",
  authDomain: "tje2026-1d6b7.firebaseapp.com",
  projectId: "tje2026-1d6b7",
  storageBucket: "tje2026-1d6b7.firebasestorage.app",
  messagingSenderId: "970413779738",
  appId: "1:970413779738:web:ec0221ef94072aeaa6daa3"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

const COL_INSCRICOES = "inscricoes";

// O totem nunca deve manter sessão entre uma pessoa e outra: cada tentativa
// de login é validada e a conta é imediatamente desconectada, então usamos
// persistência em memória (NONE) para não deixar rastro entre usos.
auth.setPersistence(firebase.auth.Auth.Persistence.NONE).catch((err) => {
  console.error("Falha ao configurar persistência do login:", err);
});

const DOMINIO_LOGIN = "participantes.tje2026.app";
