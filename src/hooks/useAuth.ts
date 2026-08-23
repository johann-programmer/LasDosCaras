import { useCallback, useEffect, useMemo, useState } from 'react'

/** Usuario autenticado */
export type AuthUser = {
  id: string
  name: string
  email: string
}

const AUTH_STORAGE_KEY = 'lasdoscaras-auth-user'
const ADMIN_EMAIL = 'admin@lasdoscaras.com'
const ADMIN_PASSWORD = '123456'

/**
 * Recupera la sesión almacenada en localStorage.
 */
const getStoredUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null

  const savedUser = window.localStorage.getItem(AUTH_STORAGE_KEY)
  if (!savedUser) return null

  try {
    const parsedUser = JSON.parse(savedUser) as Partial<AuthUser>

    if (!parsedUser.id || !parsedUser.name || !parsedUser.email) {
      return null
    }

    return {
      id: parsedUser.id,
      name: parsedUser.name,
      email: parsedUser.email,
    }
  } catch {
    return null
  }
}

/**
 * Hook encargado de gestionar la autenticación
 * y la persistencia de la sesión.
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser)

  /** Guarda o elimina la sesión del usuario. */
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (user) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
      return
    }

    window.localStorage.removeItem(AUTH_STORAGE_KEY)
  }, [user])

  /** Inicia sesión validando las credenciales. */
  const login = useCallback(async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail || !password.trim()) {
      throw new Error('Debes ingresar correo y contraseña.')
    }

    if (normalizedEmail !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      throw new Error('Credenciales inválidas.')
    }

    setUser({
      id: '1',
      name: 'Administrador',
      email: ADMIN_EMAIL,
    })
  }, [])

  /** Cierra la sesión del usuario. */
  const logout = useCallback(() => {
    setUser(null)
  }, [])

  return useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, login, logout],
  )
}

export default useAuth