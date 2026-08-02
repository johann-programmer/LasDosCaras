import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Simulación de autenticación
        if (email === "admin@correo.com" && password === "123456") {
            alert("Bienvenido");
            navigate("/dashboard");
        } else {
            alert("Correo o contraseña incorrectos");
        }
    };

    return (
        <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                background: "#f5f5f5",
            }}>
            <form
                onSubmit={handleLogin}
                style={{
                    width: 350,
                    background: "#fff",
                    padding: 30,
                    borderRadius: 10,
                    boxShadow: "0 4px 10px rgba(0,0,0,.1)",
                }}            >
                <h2 style={{ textAlign: "center" }}>Iniciar sesión</h2>

                <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                        width: "100%",
                        padding: 10,
                        marginTop: 20,
                        marginBottom: 15,
                    }}/>

                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                        width: "100%",
                        padding: 10,
                        marginBottom: 20,
                    }}/>

                <button
                    type="submit"
                    style={{
                        width: "100%",
                        padding: 10,
                        background: "#2563eb",
                        color: "#fff",
                        border: "none",
                        borderRadius: 5,
                        cursor: "pointer",
                    }}>
                    Ingresar
                </button>
            </form>
        </div>
    );
}