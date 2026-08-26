import React from 'react';
import { Link } from 'react-router-dom';

const AdminCategories: React.FC = () => {
  return (
    <div className="app-page">
      <div className="app-page-container">
        <h1 className="app-title">Administración de categorías</h1>
        <p className="app-muted">Módulo en construcción.</p>
        <Link to="/" className="app-btn" style={{ width: 'fit-content' }}>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default AdminCategories;
