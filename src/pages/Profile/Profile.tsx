import { useAuth } from "../../hooks/useAuth";

function Profile() {
  const { user, logout } = useAuth();

  if (!user) {
    return <p>No hay un usuario autenticado.</p>;
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <div>
      <h1>Mi perfil</h1>

      <div>
        <p>
          <strong>Nombre:</strong> {user.name}
        </p>

        <p>
          <strong>Correo:</strong> {user.email}
        </p>
      </div>

      <button onClick={handleLogout}>
        Cerrar sesión
      </button>
    </div>
  );
}

export default Profile;