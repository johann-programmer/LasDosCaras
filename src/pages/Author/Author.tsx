import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface AuthorItem {
  id: string;
  name: string;
  email: string;
  role: string;
  bio?: string;
  avatarUrl?: string;
  articlesCount?: number;
}

export const Author: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Petición asíncrona enviada como función callback
  const { data: authors, loading, error } = useFetch<AuthorItem[]>(async () => {
    const res = await fetch(`${API_BASE}/authors`);
    if (!res.ok) {
      throw new Error('No se pudo obtener la lista de autores.');
    }
    const data = await res.json();
    return Array.isArray(data) ? data : data?.authors || [];
  }, []);

  // Datos de respaldo en caso de que la API aún no esté conectada o falle
  const defaultAuthors: AuthorItem[] = [
    {
      id: '1',
      name: 'Johann Programmer',
      email: 'johann@lasdoscaras.com',
      role: 'Desarrollador / Redactor Principal',
      bio: 'Especialista en arquitectura Web y desarrollo de plataformas interactivas.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      articlesCount: 12,
    },
    {
      id: '2',
      name: 'Justin Castillo',
      email: 'justin@lasdoscaras.com',
      role: 'Desarrollador Frontend & UI',
      bio: 'Enfocado en la experiencia de usuario, optimización y diseño responsivo.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      articlesCount: 8,
    },
  ];

  const authorList = (authors && authors.length > 0) ? authors : defaultAuthors;

  const filteredAuthors = authorList.filter(
    (author) =>
      author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      author.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Autores de Las Dos Caras
        </h1>
        <p style={{ color: '#666' }}>
          Descubre a las mentes detrás de nuestras opiniones y artículos.
        </p>

        <input
          type="text"
          placeholder="Buscar autor por nombre o rol..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            marginTop: '1.25rem',
            width: '100%',
            maxWidth: '420px',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: '1px solid #ccc',
            fontSize: '1rem',
            outline: 'none',
          }}
        />
      </header>

      {loading && <p style={{ textAlign: 'center' }}>Cargando autores...</p>}
      {error && (
        <p style={{ textAlign: 'center', color: '#dc2626', marginBottom: '1rem' }}>
          Aviso: Mostrando datos locales de respaldo.
        </p>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {filteredAuthors.map((author) => (
          <div
            key={author.id}
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.5rem',
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <img
              src={author.avatarUrl || 'https://via.placeholder.com/100'}
              alt={author.name}
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                objectFit: 'cover',
                marginBottom: '1rem',
              }}
            />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 0.25rem 0' }}>
              {author.name}
            </h3>
            <span style={{ fontSize: '0.875rem', color: '#2563eb', fontWeight: 500, marginBottom: '0.75rem' }}>
              {author.role}
            </span>
            <p style={{ fontSize: '0.9rem', color: '#4b5563', lineHeight: '1.4', marginBottom: '1rem', flex: 1 }}>
              {author.bio || 'Sin biografía disponible.'}
            </p>
            <small style={{ color: '#9ca3af', marginBottom: '1rem' }}>
              Publicaciones: <strong>{author.articlesCount ?? 0}</strong>
            </small>

            <Link
              to={`/author/${author.id}`}
              style={{
                width: '100%',
                padding: '0.6rem',
                backgroundColor: '#2563eb',
                color: '#fff',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '0.9rem',
              }}
            >
              Ver Perfil Completo
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Author;