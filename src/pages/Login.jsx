import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ClawMachine3D } from "../components/dashboard/ClawMachine3D";
import "../styles/dashboard.css";

export function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, senha);

    if (result.success) {
      navigate("/");
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-pattern teddy-pattern flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl overflow-hidden rounded-[1.75rem] bg-white shadow-[0_40px_80px_-40px_rgba(11,31,92,0.6)] ring-1 ring-slate-900/5 md:grid md:grid-cols-[1.05fr_1fr]">
        {/* Painel da marca */}
        <aside className="mb-login-marca relative flex flex-col items-center justify-center gap-4 px-6 py-8 text-center text-white md:py-12">
          <img
            src="/MandabolaLogo.png"
            alt="Manda Bola Premium Diversões"
            className="mb-login-logo w-36 h-36 md:w-44 md:h-44 object-contain"
          />
          <div className="mb-page-header-entra">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Manda Bola Premium</h1>
            <p className="mt-1 text-sm text-blue-100/80">Gestão inteligente de gruas e máquinas de pelúcia</p>
          </div>
          <ClawMachine3D className="hidden md:block mt-2" />
          <p className="hidden md:flex items-center gap-2 text-xs text-blue-100/70">
            <span className="mb-pulso" aria-hidden="true" /> Operação, vendas e manutenção em um só lugar
          </p>
        </aside>

        {/* Formulário */}
        <section className="px-6 py-8 sm:px-10 md:py-12">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Bem-vindo de volta</p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-primary-dark">Entrar no sistema</h2>
          </div>

        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="on">
          {error && (
            <div className="alert alert-error mb-alerta-entra" role="alert">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 flex items-center gap-2"
            >
              <svg
                className="w-4 h-4 text-primary"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="seu@email.com"
              autoComplete="username"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="senha"
              className="block text-sm font-semibold text-gray-700 flex items-center gap-2"
            >
              <svg
                className="w-4 h-4 text-primary"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              Senha
            </label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="spinner w-5 h-5"></div>
                Entrando...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                Entrar
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 rounded-full">
                ou
              </span>
            </div>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            Não tem uma conta?{" "}
            <Link
              to="/registrar"
              className="font-bold text-primary hover:text-primary-dark transition-colors inline-flex items-center gap-1"
            >
              Registre-se aqui
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </p>
        </div>


          {/* Footer decorativo */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              Made by SelfMachine
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
