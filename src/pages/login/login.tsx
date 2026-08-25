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
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

import "./login.css";

import logo from "../../assets/logo.png";


function Login() {
  const { login } = useAuth();
  const navigator = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

const handleLogin = async (
  e: FormEvent<HTMLFormElement>
) => {
  e.preventDefault();

  setError("");
  setLoading(true);

  try {
    await login(email, password);

    console.log("Inicio de sesión exitoso");

    navigator("/");
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

            <input
              id="password"
              type="password"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
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