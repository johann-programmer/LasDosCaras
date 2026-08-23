import { Routes, Route } from 'react-router-dom';

import Home from '../pages/Home';
import Login from '../pages/login/login';
import Register from '../pages/Register/Register';
import Category from '../pages/Category';
import View from '../pages/View';
import NewView from '../pages/views/NewView';
import EditView from '../pages/views/EditView';
import Profile from '../pages/Profile/Profile';
import Search from '../pages/Search';
import Author from '../pages/Author';

import AdminUsers from '../pages/admin/Users';
import AdminCategories from '../pages/admin/Categories';
import AdminModeration from '../pages/admin/Moderation';

import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/categories/:id" element={<Category />} />

      <Route path="/views/:id" element={<View />} />
      <Route path="/views/new" element={<NewView />} />
      <Route path="/views/:id/edit" element={<EditView />} />

      <Route path="/profile" element={<Profile />} />
      <Route path="/search" element={<Search />} />
      <Route path="/authors/:id" element={<Author />} />

      {/* Admin routes */}
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/categories" element={<AdminCategories />} />
      <Route path="/admin/moderation" element={<AdminModeration />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;