import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Car, 
  DollarSign,
  Calendar,
  Navigation,
  X,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export default function CustomerPortal() {
  const { customerId } = useParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({
    identifier: '', // email or booking ID
    phone: ''
  });
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Mock customer data - replace with actual API calls
  const mockCustomer = {
    id: customerId,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    bookings: [
      {
        id: 'BK1234567890',
        status: 'completed',
        pickupLocation: '123 Main St, Downtown',
        dropoffLocation: '456 Oak Ave, Uptown',
        pickupDate: '2024-01-15',
        pickupTime: '14:30',
        vehicleType: 'Sedan',
        driver: {
          name: 'Mike Johnson',
          phone: '+1987654321',
          vehicle: 'Toyota Camry - ABC123'
        },
        fare: 45.00,
        createdAt: '2024-01-14T10:00:00Z'
      },
      {
        id: 'BK1234567891',
        status: 'confirmed',
        pickupLocation: '789 Pine St, Midtown',
        dropoffLocation: '321 Elm St, Westside',
        pickupDate: '2024-01-20',
        pickupTime: '09:15',
        vehicleType: 'SUV',
        driver: {
          name: 'Sarah Wilson',
          phone: '+1555666777',
          vehicle: 'Honda CR-V - XYZ789'
        },
        fare: 65.00,
        createdAt: '2024-01-18T15:30:00Z'
      },
      {
        id: 'BK1234567892',
        status: 'pending',
        pickupLocation: '555 Broadway, Theater District',
        dropoffLocation: '888 Park Ave, Upper East',
        pickupDate: '2024-01-25',
        pickupTime: '19:00',
        vehicleType: 'Luxury Car',
        fare: null, // Pending pricing
        createdAt: '2024-01-19T12:00:00Z'
      }
    ]
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    // Mock login - replace with actual authentication
    if (loginData.identifier && loginData.phone) {
      setIsLoggedIn(true);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'confirmed':
        return <Clock className="h-4 w-4" />;
      case 'in_progress':
        return <Navigation className="h-4 w-4" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      case 'cancelled':
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Customer Portal
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Access your bookings and trip history
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Enter your email or booking ID and phone number to access your bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="identifier">Email or Booking ID</Label>
                  <Input
                    id="identifier"
                    value={loginData.identifier}
                    onChange={(e) => setLoginData(prev => ({ ...prev, identifier: e.target.value }))}
                    placeholder="john@example.com or BK1234567890"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={loginData.phone}
                    onChange={(e) => setLoginData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1234567890"
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Access My Bookings
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {mockCustomer.name}!</h1>
            <p className="text-gray-600">Manage your bookings and trip history</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setIsLoggedIn(false)}
          >
            Sign Out
          </Button>
        </div>

        {/* Customer Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Your Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm">{mockCustomer.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm">{mockCustomer.phone}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm">Customer since Jan 2024</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Your Bookings</CardTitle>
            <CardDescription>
              View and manage your current and past bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockCustomer.bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge className={getStatusColor(booking.status)}>
                          {getStatusIcon(booking.status)}
                          <span className="ml-1 capitalize">{booking.status.replace('_', ' ')}</span>
                        </Badge>
                        <span className="text-sm text-gray-500">#{booking.id}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <div className="flex items-start space-x-2 mb-2">
                            <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">Pickup</p>
                              <p className="text-sm text-gray-600">{booking.pickupLocation}</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <MapPin className="h-4 w-4 text-red-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">Drop-off</p>
                              <p className="text-sm text-gray-600">{booking.dropoffLocation}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <div>
                              <p className="text-sm font-medium">Date & Time</p>
                              <p className="text-sm text-gray-600">
                                {booking.pickupDate} at {booking.pickupTime}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Car className="h-4 w-4 text-purple-600" />
                            <div>
                              <p className="text-sm font-medium">Vehicle</p>
                              <p className="text-sm text-gray-600">{booking.vehicleType}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {booking.driver && (
                        <div className="bg-blue-50 rounded-lg p-3 mb-3">
                          <p className="text-sm font-medium text-blue-900 mb-1">Driver Details</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
                            <p><strong>Name:</strong> {booking.driver.name}</p>
                            <p><strong>Phone:</strong> {booking.driver.phone}</p>
                            <p><strong>Vehicle:</strong> {booking.driver.vehicle}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">
                            {booking.fare ? `$${booking.fare.toFixed(2)}` : 'Pricing pending'}
                          </span>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          
                          {booking.status === 'pending' && (
                            <Button size="sm" variant="outline">
                              Cancel
                            </Button>
                          )}
                          
                          {booking.status === 'confirmed' && (
                            <Button size="sm">
                              <Navigation className="h-4 w-4 mr-1" />
                              Track Driver
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Booking Details Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Booking Details</CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedBooking(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Booking ID</p>
                  <p className="text-sm">{selectedBooking.id}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Badge className={getStatusColor(selectedBooking.status)}>
                    {getStatusIcon(selectedBooking.status)}
                    <span className="ml-1 capitalize">{selectedBooking.status.replace('_', ' ')}</span>
                  </Badge>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Trip Details</p>
                  <div className="space-y-2 mt-1">
                    <p className="text-sm"><strong>From:</strong> {selectedBooking.pickupLocation}</p>
                    <p className="text-sm"><strong>To:</strong> {selectedBooking.dropoffLocation}</p>
                    <p className="text-sm"><strong>Date:</strong> {selectedBooking.pickupDate}</p>
                    <p className="text-sm"><strong>Time:</strong> {selectedBooking.pickupTime}</p>
                    <p className="text-sm"><strong>Vehicle:</strong> {selectedBooking.vehicleType}</p>
                  </div>
                </div>

                {selectedBooking.driver && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Driver Information</p>
                    <div className="space-y-1 mt-1">
                      <p className="text-sm"><strong>Name:</strong> {selectedBooking.driver.name}</p>
                      <p className="text-sm"><strong>Phone:</strong> {selectedBooking.driver.phone}</p>
                      <p className="text-sm"><strong>Vehicle:</strong> {selectedBooking.driver.vehicle}</p>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-500">Fare</p>
                  <p className="text-lg font-bold">
                    {selectedBooking.fare ? `$${selectedBooking.fare.toFixed(2)}` : 'Pricing pending'}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Booked On</p>
                  <p className="text-sm">{new Date(selectedBooking.createdAt).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}