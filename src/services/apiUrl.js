// Endereço do backend. Aceita VITE_API_URL com ou sem "/api" e com ou sem
// barra no final: https://x.onrender.com, https://x.onrender.com/ e
// https://x.onrender.com/api viram todos https://x.onrender.com/api.
const PADRAO = "https://mandabola-backend.onrender.com/api";

export const API_URL = (() => {
  const bruto = String(import.meta.env.VITE_API_URL || "").trim();
  // Valor que não é endereço http(s) (ex: uma chave colada por engano) é ignorado.
  const url = (/^https?:\/\//i.test(bruto) ? bruto : PADRAO).replace(/\/+$/, "");
  return /\/api$/.test(url) ? url : `${url}/api`;
})();
