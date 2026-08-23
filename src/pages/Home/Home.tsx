import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>Las Dos Caras</h1>

        <div className="home-user">
          {user && (
            <span>
              Hola, {user.name}
            </span>
          )}

          <button onClick={() => navigate("/profile")}>
            Mi perfil
          </button>

          <button onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="home-content">
        <div className="home-card">
          <h2>Bienvenido a Las Dos Caras</h2>

          <p>
            Has iniciado sesión correctamente.
          </p>

          <p>
            Desde aquí puedes acceder a tu perfil y utilizar
            las funcionalidades de la aplicación.
          </p>

          <button
            className="home-profile-button"
            onClick={() => navigate("/profile")}
          >
            Ver mi perfil
          </button>
        </div>
      </main>
    </div>
  );
}