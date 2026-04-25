import React from 'react';
import { Route, Routes, RouteProps } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';
import SuperAdminLayout from './layouts/SuperAdminLayout';
import Approuter from './approuter/Approuter';
import Privateroutes from './approuter/Privateroutes';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersDetails from './pages/admin/UsersDetails';
import Createuser from './pages/admin/Createuser';
import MonthManagement from './pages/admin/MonthManagement';
import MilkManagement from './pages/admin/MilkManagement';
import Setting from './pages/admin/setting';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import AdminManagement from './pages/superadmin/AdminManagement';
import ViewAdminUsers from './pages/superadmin/ViewAdminUsers';

const Dashbord: React.FC = () => {
  const { mee } = useSelector((state: RootState) => state.mee);
  const role = mee?.role;

  if (role === 'superadmin') {
    return (
      <SuperAdminLayout>
        <Routes>
          <Route path="/" element={<SuperAdminDashboard />} />
          <Route path="/admins" element={<AdminManagement />} />
          <Route path="/create-admin" element={<Createuser />} />
          <Route path="/admin/:adminId/users" element={<ViewAdminUsers />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SuperAdminLayout>
    );
  }

  if (role === 'admin') {
    return (
      <AdminLayout>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/users" element={<UsersDetails />} />
          <Route path="/users/create" element={<Createuser />} />
          <Route path="/users/edit/:id" element={<Createuser />} />
          <Route path="/month" element={<MonthManagement />} />
          <Route path="/milk" element={<MilkManagement />} />
          <Route path="/setting" element={<Setting />} />
        </Routes>
      </AdminLayout>
    );
  }

  return (
    <UserLayout>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </UserLayout>
  );
};

export default Dashbord;