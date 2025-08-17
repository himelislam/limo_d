import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './pages/auth/Login';
import PassengerLogin from './pages/auth/PassengerLogin';
import PassengerRegister from './pages/auth/PassengerRegister';
import BusinessRegister from './pages/business/BusinessRegister';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminVehicles from './pages/admin/Vehicles';
import AdminTrips from './pages/admin/Trips';
import AdminBusinesses from './pages/admin/Businesses';
import AdminRegister from './pages/auth/AdminRegister';
import BusinessDashboard from './pages/business/Dashboard';
import BusinessDrivers from './pages/business/Drivers';
import BusinessVehicles from './pages/business/Vehicles';
import BusinessTrips from './pages/business/Trips';
import BusinessSettings from './pages/business/Settings';
import DriverDashboard from './pages/driver/Dashboard';
import DriverTrips from './pages/driver/Trips';
import PassengerDashboard from './pages/passenger/Dashboard';
import PassengerTrips from './pages/passenger/Trips';
import PassengerBooking from './pages/passenger/Booking';
import BookingWidget from './pages/public/BookingWidget';
import CustomerPortal from './pages/public/CustomerPortal';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import BookingConfirmation from './pages/public/BookingConfirmation';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/passenger/login" element={<PassengerLogin />} />
            <Route path="/passenger/register" element={<PassengerRegister />} />
            <Route path="/business/register" element={<BusinessRegister />} />
            <Route path="/admin/register" element={<AdminRegister />} />
            
            {/* Public Booking Widget */}
            <Route path="/widget/:widgetId" element={<BookingWidget />} />
            <Route path="/portal/:businessId" element={<CustomerPortal />} />
            
            {/* Public booking confirmation routes */}
            <Route path="/booking/confirm/:token" element={<BookingConfirmation />} />
            <Route path="/booking/decline/:token" element={<BookingConfirmation />} />
            
            {/* Super Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="businesses" element={<AdminBusinesses />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="vehicles" element={<AdminVehicles />} />
              <Route path="trips" element={<AdminTrips />} />
            </Route>
            
            {/* Business Owner Routes */}
            <Route path="/business" element={
              <ProtectedRoute allowedRoles={['business_owner']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<BusinessDashboard />} />
              <Route path="drivers" element={<BusinessDrivers />} />
              <Route path="vehicles" element={<BusinessVehicles />} />
              <Route path="trips" element={<BusinessTrips />} />
              <Route path="settings" element={<BusinessSettings />} />
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
              <Route path="booking" element={<PassengerBooking />} />
            </Route>
            
            {/* Default Redirects */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/business" element={<Navigate to="/business/dashboard" replace />} />
            <Route path="/driver" element={<Navigate to="/driver/dashboard" replace />} />
            <Route path="/passenger" element={<Navigate to="/passenger/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
