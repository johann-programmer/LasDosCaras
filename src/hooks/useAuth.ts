import { useCallback, useEffect, useMemo, useState } from "react";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: string;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

type LoginResponse = {
  token: string;
  user: AuthUser;
};

const AUTH_STORAGE_KEY = "lasdoscaras-auth-session";

// URL de tu API / webhook
const AUTH_WEBHOOK_URL =
  "http://localhost:3000/api/auth/login";

/**
 * Recupera la sesión almacenada en localStorage.
 */
const getStoredSession = (): AuthSession | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const savedSession = window.localStorage.getItem(
    AUTH_STORAGE_KEY
  );

  if (!savedSession) {
    return null;
  }

  try {
    const parsedSession = JSON.parse(
      savedSession
    ) as Partial<AuthSession>;

    if (!parsedSession.token || !parsedSession.user) {
      return null;
    }

    const user = parsedSession.user;

    if (
      !user.id ||
      !user.email ||
      !user.name ||
      !user.role ||
      !user.status ||
      !user.createdAt
    ) {
      return null;
    }

    return {
      token: parsedSession.token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      },
    };
  } catch (error) {
    console.error(
      "Error recuperando la sesión:",
      error
    );

    return null;
  }
};

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(
    getStoredSession
  );

  /**
   * Guarda la sesión en localStorage.
   */
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (session) {
      window.localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify(session)
      );
    } else {
      window.localStorage.removeItem(
        AUTH_STORAGE_KEY
      );
    }
  }, [session]);

  /**
   * Inicia sesión utilizando el webhook.
   */
  const login = useCallback(
    async (email: string, password: string) => {
      const normalizedEmail = email
        .trim()
        .toLowerCase();

      if (!normalizedEmail || !password) {
        throw new Error(
          "Debes ingresar correo y contraseña."
        );
      }

      const response = await fetch(
        AUTH_WEBHOOK_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
            password: password,
          }),
        }
      );

      /**
       * Credenciales incorrectas.
       */
      if (response.status === 401) {
        throw new Error(
          "Correo o contraseña incorrectos."
        );
      }

      /**
       * Otros errores HTTP.
       */
      if (!response.ok) {
        throw new Error(
          `Error del servidor: ${response.status}`
        );
      }

      /**
       * El webhook devuelve:
       *
       * {
       *   "token": "...",
       *   "user": {
       *      "id": "...",
       *      "email": "...",
       *      "name": "...",
       *      "role": "...",
       *      "status": "...",
       *      "createdAt": "..."
       *   }
       * }
       */
      const data: LoginResponse =
        await response.json();

      console.log(
        "Respuesta del API:",
        data
      );

      /**
       * Validamos que exista el token.
       */
      if (!data.token) {
        throw new Error(
          "El servidor no devolvió un token."
        );
      }

      /**
       * Validamos que exista el usuario.
       */
      if (!data.user) {
        throw new Error(
          "El servidor no devolvió información del usuario."
        );
      }

      /**
       * Creamos la sesión.
       */
      const newSession: AuthSession = {
        token: data.token,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          status: data.user.status,
          createdAt: data.user.createdAt,
        },
      };

      /**
       * Guardamos la sesión en el estado.
       * El useEffect se encargará de guardarla
       * también en localStorage.
       */
      setSession(newSession);

      console.log(
        "Usuario autenticado:",
        newSession.user
      );

      console.log(
        "Token:",
        newSession.token
      );
    },
    []
  );

  /**
   * Cierra la sesión.
   */
  const logout = useCallback(() => {
    setSession(null);
  }, []);

  /**
   * Token JWT.
   */
  const token = session?.token ?? null;

  /**
   * Usuario autenticado.
   */
  const user = session?.user ?? null;

  return useMemo(
    () => ({
      user,
      token,
      session,
      isAuthenticated: Boolean(session),
      login,
      logout,
    }),
    [
      user,
      token,
      session,
      login,
      logout,
    ]
  );
}

export default useAuth;

// adding comment to push.

/*
Para hacer llamada usando el token

const { token } = useAuth();

const response = await fetch(
  "http://localhost:3000/api/posts",
  {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  }
);*/