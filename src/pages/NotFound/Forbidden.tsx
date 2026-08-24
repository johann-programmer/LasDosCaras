import { useNavigate } from "react-router-dom";

export default function ForbiddenPage() {
    const navigate = useNavigate();

    return (
        <main className="forbidden-page">
            <div className="forbidden-container">

                <div className="forbidden-code">
                    403
                </div>

                <h1>Acceso denegado</h1>

                <p>
                    No tienes los permisos necesarios
                    para acceder a esta página.
                </p>

                <button
                    type="button"
                    onClick={() => navigate(-1)}
                >
                    Regresar
                </button>

            </div>
        </main>
    );
}