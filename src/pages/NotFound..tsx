
import { Link } from "react-router-dom";

function NotFoundPage() {
    return (
        <main>
            <div >

                <div>
                    404
                </div>

                <h1>Página no encontrada</h1>

                <p>
                    Lo sentimos, la página que estás buscando no existe
                    o fue movida a otra ubicación.
                </p>

                <Link to="/">
                    Volver al inicio
                </Link>

            </div>
        </main>
    );
}

export default NotFoundPage;

