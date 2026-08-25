// src/routes/AppRoutes.tsx
import { Routes, Route } from 'react-router-dom';

import Login from '../pages/login/login';
import { Home } from '../pages/Home/Home';
import Register from '../pages/Register/Register';
import { CategoryDetail } from '../pages/CategoryDetail/CategoryDetail';
import { ViewDetail } from '../pages/ViewDetail/ViewDetail';
import NewView from '../pages/views/NewView';
import EditView from '../pages/views/EditView';
import Profile from '../pages/Profile/Profile';
import Search from '../pages/Search/Search';
import { AuthorDetail } from '../pages/AuthorDetail/AuthorDetail';
import Forbidden from '../pages/NotFound/Forbidden';
import NotFound from '../pages/NotFound/NotFound';

import AdminUsers from '../pages/Admin/AdminUser';
import AdminCategories from '../pages/Admin/AdminCategories';
import AdminModeration from '../pages/Admin/AdminModeration';

import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/categories/:id" element={<CategoryDetail />} />
      <Route path="/views/:id" element={<ViewDetail />} />
      <Route path="/search" element={<Search />} />
      <Route path="/authors/:id" element={<AuthorDetail />} />

      {/* Rutas protegidas (Requieren sesión activa) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/views/new" element={<NewView />} />
        <Route path="/views/:id/edit" element={<EditView />} />
        <Route path="/profile" element={<Profile />} />

        {/* Rutas de administrador */}
        <Route element={<RoleRoute roles={['ADMIN']} />}>
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/moderation" element={<AdminModeration />} />
        </Route>
      </Route>

      {/* Errores de acceso y 404 */}
      <Route path="/403" element={<Forbidden />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;