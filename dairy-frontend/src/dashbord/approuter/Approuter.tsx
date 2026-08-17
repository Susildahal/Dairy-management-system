import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Loading from "../ui/Loading";
import ProtectedRoute from "../../components/ProtectedRoute";

// Lazy load layouts
const UserLayout = lazy(() => import("../layouts/UserLayout"));
const AdminLayout = lazy(() => import("../layouts/AdminLayout"));
const SuperAdminLayout = lazy(() => import("../layouts/SuperAdminLayout"));

// Lazy load components
const Login = lazy(() => import("../ui/Login"));
const Adminlogin = lazy(()=>import("../ui/AdminLoginVerify"))
const ForgotPassword = lazy(() => import("../ui/ForgotPassword"));
const ResetPassword = lazy(() => import("../ui/ResetPassword"));
const NotFound = lazy(() => import("../common/NotFound"));
const User = lazy(() => import("../pages/admin/UsersDetails"));

// Lazy load pages
// const LandingPage = lazy(() => import("../pages/public/LandingPage"));
// const  UserHome from "../pages/user/UserHome";
const UserHome = lazy(() => import("../pages/user/UserHome"));
const UserDashboard = lazy(() => import("../pages/user/UserDashboard"));
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const MilkManagement = lazy(() => import("../pages/admin/MilkManagement"));
const UserLoginDashboard = lazy(() => import("../pages/user/userLoginDashboard"));
const SuperAdminDashboard = lazy(() => import("../pages/superadmin/SuperAdminDashboard"));
const AdminManagement = lazy(() => import("../pages/superadmin/AdminManagement"));
const CreateAdminPage = lazy(() => import("../pages/superadmin/CreateAdminPage"));
const ViewAdminUsers = lazy(() => import("../pages/superadmin/ViewAdminUsers"));
// Typed lazy import so the Createuser component can accept the `isedit` prop
const Createuser = lazy(() => import("../pages/admin/Createuser"));
const Settings = lazy(() => import("../pages/admin/setting"));
const MonthManagement = lazy(() => import("../pages/admin/MonthManagement"));
const Addmilk = lazy(() => import("../pages/admin/Addmilk"));
const CreateMilkRecords = lazy(() => import("../pages/admin/CreateMilkRecords"));


export default function AppRouter() {
    return (
        <BrowserRouter>
            <Suspense fallback={<Loading />}>
                <Routes>
                    {/* Public Landing Page - Available for everyone */}
                    <Route path="/" element={<UserHome />} />
                    <Route
  path="/admin/login/:token"
  element={<Adminlogin/>}
/>
                    
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    
                    {/* User Routes - Accessible to both users and admins */}
                    <Route path="/user">
                        <Route index element={<UserHome />} />
                        <Route path="dashboard" element={<UserLoginDashboard />} />
                        <Route path="products" element={<div>Products Page</div>} />
                        <Route path="about" element={<div>About Page</div>} />
                        <Route path="contact" element={<div>Contact Page</div>} />
                    </Route>

                    {/* Admin Routes - Only accessible to admin users */}
                    <Route path="/admin" element={
                        <ProtectedRoute adminOnly>
                            <AdminLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="user-dashboard" element={<UserDashboard />} />
                        <Route path="users" element={<User />} />
                        <Route path="milk" element={<Addmilk />} />
                        <Route path="milk-management" element={<MilkManagement />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="create-milk-records" element={<CreateMilkRecords />} />
                        <Route path="users/create" element={<Createuser />} />
                        <Route path="/admin/users/edit/:id" element={<Createuser isedit={true} />} />
                      
                        <Route path="add-month" element={<MonthManagement />} />
                        
                        {/* Admin can also access user dashboard */}
                        <Route path="user-dashboard" element={<UserDashboard />} />
                    </Route>

                    {/* SuperAdmin Routes */}
                    <Route path="/superadmin" element={
                        <ProtectedRoute>
                            <SuperAdminLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Navigate to="/superadmin/dashboard" replace />} />
                        <Route path="dashboard" element={<SuperAdminDashboard />} />
                        <Route path="admins" element={<AdminManagement />} />
                        <Route path="create-admin" element={<CreateAdminPage />} />
                        <Route path="edit-admin/:id" element={<CreateAdminPage />} />
                        <Route path="admin/:adminId/users" element={<ViewAdminUsers />} />
                    </Route>

                    {/* Legacy redirects */}
                    <Route path="/dashboard" element={<Navigate to="/user/dashboard" replace />} />
                    <Route path="/dashbord" element={<Navigate to="/user/dashboard" replace />} />
                    
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}
