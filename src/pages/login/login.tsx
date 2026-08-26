/*
 * ------------------------------------------------------------
 * - Funcionalidades:
 * - Captura correo y contraseña.
 * - Ejecuta la autenticación.
 * - Muestra mensajes de error.
 * ------------------------------------------------------------
 */
import { useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { PasswordInput } from "../../components/PasswordInput";

import "./login.css";

import logo from "../../assets/logo.png";


type LoginLocationState = {
  from?: { pathname?: string };
  registered?: boolean;
  email?: string;
} | null;

function Login() {
  const { login } = useAuth();
  const navigator = useNavigate();
  const location = useLocation();
  const state = location.state as LoginLocationState;

  const redirectTo = state?.from?.pathname || "/";

  const [email, setEmail] = useState(state?.email ?? "");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(
    state?.registered
      ? "Cuenta creada y activada. Ya puedes iniciar sesión."
      : ""
  );
  const [loading, setLoading] = useState(false);

const handleLogin = async (
  e: FormEvent<HTMLFormElement>
) => {
  e.preventDefault();

  setError("");
  setSuccess("");
  setLoading(true);

  try {
    await login(email, password);

    console.log("Inicio de sesión exitoso");

    navigator(redirectTo, { replace: true });
  } catch (error) {
    if (error instanceof Error) {
      setError(error.message);
    } else {
      setError("Correo o contraseña incorrectos.");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="login-page">
      <div className="login-card">

        <img
          src={logo}
          alt="Las Dos Caras"
          className="login-logo"
        />

        <h1>Inicia sesión</h1>

        <p>
          Accede a tu cuenta de Las Dos Caras
        </p>

        {success && (
          <p className="login-success">
            {success}
          </p>
        )}

        <form onSubmit={handleLogin}>

          <div className="input-group">
            <label htmlFor="email">
              Correo
            </label>

            <input
              id="email"
              type="email"
              placeholder="Ingrese su correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">
              Contraseña
            </label>

            <PasswordInput
              id="password"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="login-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Iniciando sesión..."
              : "Iniciar sesión"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default Login;

//adding comment to push