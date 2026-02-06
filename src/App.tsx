import "./App.css";
import "./index.css";
import "./i18n";
import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoginPage } from './core/pages/login'
import { LanguageProvider } from "./core/Context/LanguageContext";
import { AuthProvider } from './core/Context/AuthContext'
import Layout from './core/Layout/layout'
import { PrivateRoute } from './core/components/PrivateRoute'
import CategoriesPage from './core/pages/CategoriesPage'
import UsersPage from './core/pages/UsersPage'
import StaffPage from './core/pages/StaffPage'
import AnnouncementsPage from './core/pages/AnnouncementsPage'
import AnnouncementDetailPage from './core/pages/AnnouncementDetailPage'
import DistrictsPage from './core/pages/DistrictsPage'
import NotificationsPage from './core/pages/NotificationsPage'
import AppSettingsPage from './core/pages/AppSettingsPage'
import CreateStaffPage from './core/pages/CreateStaffPage'
import EditStaffPage from './core/pages/EditStaffPage'
import UserDetailPage from './core/pages/UserDetailPage'

// import W9FormDemo from "./core/pages/W9FormDemo";
// import CreateSalePos from "./core/pages/create-sale-2";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/announcements" />} />

            {/* Protected routes wrapped in Layout */}
            <Route 
              path="/categories" 
              element={
                <PrivateRoute>
                  <Layout>
                    <CategoriesPage />
                  </Layout>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/users" 
              element={
                <PrivateRoute>
                  <Layout>
                    <UsersPage />
                  </Layout>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/staff" 
              element={
                <PrivateRoute>
                  <Layout>
                    <StaffPage />
                  </Layout>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/announcements" 
              element={
                <PrivateRoute>
                  <Layout>
                    <AnnouncementsPage />
                  </Layout>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/announcements/:id" 
              element={
                <PrivateRoute>
                  <Layout>
                    <AnnouncementDetailPage />
                  </Layout>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/districts" 
              element={
                <PrivateRoute>
                  <Layout>
                    <DistrictsPage />
                  </Layout>
                </PrivateRoute>
              } 
            />
            <Route
              path="/notifications"
              element={
                <PrivateRoute>
                  <Layout>
                    <NotificationsPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/settings/app"
              element={
                <PrivateRoute>
                  <Layout>
                    <AppSettingsPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/create-staff"
              element={
                <PrivateRoute>
                  <Layout>
                    <CreateStaffPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/edit-staff/:id"
              element={
                <PrivateRoute>
                  <Layout>
                    <EditStaffPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/users/:id"
              element={
                <PrivateRoute>
                  <Layout>
                    <UserDetailPage />
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* Catch-all: redirect unknown routes to announcements */}
            <Route path="*" element={<Navigate to="/announcements" />} />
          </Routes>
          {/* <Toaster /> */}
          {/* <ErrorModal /> */}
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
