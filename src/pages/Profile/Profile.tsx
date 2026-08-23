import { useAuth } from "../../hooks/useAuth";
import "./Profile.css";

function Profile() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <p className="profile-empty">
            No hay un usuario autenticado.
          </p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="profile-page">
      <div className="profile-card">

        <h1>Mi perfil</h1>

        <p className="profile-description">
          Información de tu cuenta
        </p>

        <div className="profile-info">

          <div className="profile-field">
            <span>Nombre</span>
            <p>{user.name}</p>
          </div>

          <div className="profile-field">
            <span>Correo</span>
            <p>{user.email}</p>
          </div>

        </div>

        <button
          className="profile-logout"
          onClick={handleLogout}
        >
          Cerrar sesión
        </button>

      </div>
    </div>
  );
}

export default Profile;