
// ==============================================================================
// ATENÇÃO: ERRO DE API KEY INVÁLIDA (auth/api-key-not-valid)
// ------------------------------------------------------------------------------
// O erro que você está vendo ("auth/api-key-not-valid") significa que as
// configurações do Firebase abaixo NÃO SÃO VÁLIDAS.
//
// VOCÊ PRECISA SUBSTITUIR OS VALORES DE PLACEHOLDER (YOUR_API_KEY, etc.)
// PELAS SUAS CREDENCIAIS REAIS DO FIREBASE.
//
// 1. Vá para o Console do Firebase (https://console.firebase.google.com/)
// 2. Selecione seu projeto.
// 3. Vá para "Configurações do projeto" (ícone de engrenagem).
// 4. Na aba "Geral", role para baixo até "Seus apps".
// 5. Selecione seu app da Web.
// 6. Em "Configuração do SDK", escolha a opção "Configuração".
// 7. Copie os valores de `apiKey`, `authDomain`, `projectId`, etc.,
//    e cole-os nos lugares correspondentes abaixo.
// ==============================================================================

// Import the functions you need from the SDKs you need
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

// TODO: Add your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // SUBSTITUA ISTO!
  authDomain: "YOUR_AUTH_DOMAIN", // SUBSTITUA ISTO!
  projectId: "YOUR_PROJECT_ID", // SUBSTITUA ISTO!
  storageBucket: "YOUR_STORAGE_BUCKET", // SUBSTITUA ISTO!
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // SUBSTITUA ISTO!
  appId: "YOUR_APP_ID", // SUBSTITUA ISTO!
  // measurementId: "YOUR_MEASUREMENT_ID" // Opcional, SUBSTITUA SE TIVER
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth: Auth = getAuth(app);

export { app, auth };
