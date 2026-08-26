import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Profile.css';

function Profile() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <p className="profile-empty">No hay un usuario autenticado.</p>
          <Link to="/login" className="profile-link-btn">
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h1>Mi perfil</h1>
        <p className="profile-description">Información de tu cuenta</p>

        <div className="profile-info">
          <div className="profile-field">
            <span>Nombre</span>
            <p>{user.name}</p>
          </div>

          <div className="profile-field">
            <span>Correo</span>
            <p>{user.email}</p>
          </div>

          <div className="profile-field">
            <span>Rol</span>
            <p>{user.role}</p>
          </div>

          <div className="profile-field">
            <span>Estado</span>
            <p>{user.status}</p>
          </div>

          <div className="profile-field">
            <span>Miembro desde</span>
            <p>{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="profile-actions">
          <Link to={`/authors/${user.id}`} className="profile-link-btn">
            Ver perfil público
          </Link>
          <Link to="/" className="profile-secondary-btn">
            Ir al inicio
          </Link>
          <button
            type="button"
            className="profile-logout"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
