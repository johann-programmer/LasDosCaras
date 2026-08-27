import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import {
  ArrowLeft,
  User,
  Shield,
  ShieldOff,
  UserX,
  UserCheck,
  RefreshCw,
  Search,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status?: 'active' | 'banned';
  createdAt?: string;
}

export const AdminUser: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data: users, loading, error, refetch } = useFetch<UserItem[]>(
    async () => {
      const res = await fetch(`${API_BASE}/users`);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || 'No se pudo obtener la lista de usuarios.');
      }
      const payload = await res.json();
      return Array.isArray(payload) ? payload : payload?.users || [];
    },
    []
  );

  const handleToggleRole = async (user: UserItem) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    setUpdatingId(user.id);

    try {
      const res = await fetch(`${API_BASE}/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) throw new Error('Error al actualizar el rol.');
      await refetch();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleStatus = async (user: UserItem) => {
    const newStatus = user.status === 'banned' ? 'active' : 'banned';
    setUpdatingId(user.id);

    try {
      const res = await fetch(`${API_BASE}/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Error al cambiar el estado del usuario.');
      await refetch();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = (users || []).filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-page">
      <div className="app-page-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
          <Link to="/" className="app-back">
            <ArrowLeft size={16} /> Volver al Inicio
          </Link>
          <button
            type="button"
            onClick={() => refetch()}
            className="app-icon-btn"
            title="Recargar lista"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        <header className="app-card" style={{ marginBottom: 20 }}>
          <h1 className="app-title" style={{ fontSize: '1.8rem' }}>
            Administración de Usuarios
          </h1>
          <p className="app-muted" style={{ fontSize: 14 }}>
            Gestiona los roles, permisos y suspensiones de los usuarios de la plataforma.
          </p>
        </header>

        <div className="app-card" style={{ marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
          <Search size={18} className="app-muted" />
          <input
            type="text"
            className="app-input"
            placeholder="Buscar por nombre o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', color: 'inherit' }}
          />
        </div>

        {loading ? (
          <div className="app-card" style={{ textAlign: 'center', padding: 30 }}>
            <p className="app-muted">Cargando usuarios...</p>
          </div>
        ) : error ? (
          <div className="app-card" style={{ textAlign: 'center', padding: 30 }}>
            <p className="app-error">{error}</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="app-card" style={{ textAlign: 'center', padding: 30 }}>
            <p className="app-muted">No se encontraron usuarios.</p>
          </div>
        ) : (
          <div className="app-card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--app-border)', color: 'var(--app-text-muted)' }}>
                  <th style={{ padding: '12px 8px' }}>Usuario</th>
                  <th style={{ padding: '12px 8px' }}>Correo</th>
                  <th style={{ padding: '12px 8px' }}>Rol</th>
                  <th style={{ padding: '12px 8px' }}>Estado</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--app-border)' }}>
                    <td style={{ padding: '12px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <User size={18} className="app-muted" />
                      <span>{user.name}</span>
                    </td>
                    <td style={{ padding: '12px 8px' }}>{user.email}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 12,
                          background: user.role === 'admin' ? 'rgba(59, 130, 246, 0.15)' : 'var(--app-bg-soft)',
                          color: user.role === 'admin' ? '#3b82f6' : 'var(--app-text-muted)',
                          fontWeight: 600,
                        }}
                      >
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 12,
                          background: user.status === 'banned' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                          color: user.status === 'banned' ? '#ef4444' : '#22c55e',
                          fontWeight: 600,
                        }}
                      >
                        {user.status === 'banned' ? 'Suspendido' : 'Activo'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="app-btn"
                          disabled={updatingId === user.id}
                          onClick={() => handleToggleRole(user)}
                          title="Cambiar rol de usuario"
                        >
                          {user.role === 'admin' ? <ShieldOff size={14} /> : <Shield size={14} />}
                          {user.role === 'admin' ? ' Quitar Admin' : ' Hacer Admin'}
                        </button>

                        <button
                          type="button"
                          className="app-btn"
                          style={{
                            borderColor: user.status === 'banned' ? '#22c55e' : '#ef4444',
                            color: user.status === 'banned' ? '#22c55e' : '#ef4444',
                          }}
                          disabled={updatingId === user.id}
                          onClick={() => handleToggleStatus(user)}
                          title={user.status === 'banned' ? 'Reactivar acceso' : 'Suspender acceso'}
                        >
                          {user.status === 'banned' ? <UserCheck size={14} /> : <UserX size={14} />}
                          {user.status === 'banned' ? ' Reactivar' : ' Suspender'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUser;