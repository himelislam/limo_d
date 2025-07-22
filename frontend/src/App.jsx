import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminVehicles from './pages/admin/Vehicles';
import AdminTrips from './pages/admin/Trips';
import OwnerDashboard from './pages/owner/Dashboard';
import OwnerDrivers from './pages/owner/Drivers';
import OwnerVehicles from './pages/owner/Vehicles';
import OwnerTrips from './pages/owner/Trips';
import DriverDashboard from './pages/driver/Dashboard';
import DriverTrips from './pages/driver/Trips';
import PassengerDashboard from './pages/passenger/Dashboard';
import PassengerTrips from './pages/passenger/Trips';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="vehicles" element={<AdminVehicles />} />
              <Route path="trips" element={<AdminTrips />} />
            </Route>

            {/* Owner Routes */}
            <Route path="/owner" element={
              <ProtectedRoute allowedRoles={['owner']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<OwnerDashboard />} />
              <Route path="drivers" element={<OwnerDrivers />} />
              <Route path="vehicles" element={<OwnerVehicles />} />
              <Route path="trips" element={<OwnerTrips />} />
            </Route>

            {/* Driver Routes */}
            <Route path="/driver" element={
              <ProtectedRoute allowedRoles={['driver']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<DriverDashboard />} />
              <Route path="trips" element={<DriverTrips />} />
            </Route>

            {/* Passenger Routes */}
            <Route path="/passenger" element={
              <ProtectedRoute allowedRoles={['passenger']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<PassengerDashboard />} />
              <Route path="trips" element={<PassengerTrips />} />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
