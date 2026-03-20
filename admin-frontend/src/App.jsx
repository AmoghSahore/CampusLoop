import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLogin from './components/AdminLogin.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import DashboardPage from './components/DashboardPage.jsx';
import ReportsPage from './components/ReportsPage.jsx';
import AppealsPage from './components/AppealsPage.jsx';
import UsersPage from './components/UsersPage.jsx';
import ProductsPage from './components/ProductsPage.jsx';
import LogsPage from './components/LogsPage.jsx';

const App = () => (
  <Routes>
    <Route path="/login" element={<AdminLogin />} />
    <Route
      path="/"
      element={(
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      )}
    >
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="reports" element={<ReportsPage />} />
      <Route path="appeals" element={<AppealsPage />} />
      <Route path="users" element={<UsersPage />} />
      <Route path="products" element={<ProductsPage />} />
      <Route path="logs" element={<LogsPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export default App;
