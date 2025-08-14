import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Car, Users, MapPin, DollarSign, Clock, AlertCircle, CheckCircle, Globe, Copy, ExternalLink } from 'lucide-react';
import { getVehicles } from '@/api/vehicles';
import { getTrips, getPendingTrips } from '@/api/trips';
import { getDrivers } from '@/api/drivers';
import { getMyBusiness } from '@/api/business';
import { getBookings } from '@/api/bookings';
import TripAssignmentDialog from '@/components/TripAssignmentDialog';
import QuoteDialog from '@/components/QuoteDialog';

export default function BusinessDashboard() {
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedBookingForQuote, setSelectedBookingForQuote] = useState(null);
  const [copied, setCopied] = useState(false);

  const { data: businessRes } = useQuery({
    queryKey: ['my-business'],
    queryFn: getMyBusiness,
  });
  const business = businessRes?.data;

  const { data: vehiclesRes = [] } = useQuery({
    queryKey: ['business-vehicles'],
    queryFn: getVehicles,
  });
  const vehicles = vehiclesRes?.data ?? [];

  const { data: tripsRes = [] } = useQuery({
    queryKey: ['business-trips'],
    queryFn: getTrips,
  });
  const trips = tripsRes?.data ?? [];

  const { data: driversRes = [] } = useQuery({
    queryKey: ['business-drivers'],
    queryFn: getDrivers,
  });
  const drivers = driversRes?.data ?? [];

  const { data: pendingTripsRes = [] } = useQuery({
    queryKey: ['pending-trips'],
    queryFn: getPendingTrips,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  const pendingTrips = pendingTripsRes?.data ?? [];

  const { data: bookingsRes } = useQuery({
    queryKey: ['business-bookings'],
    queryFn: getBookings,
  });
  const bookings = bookingsRes?.data || [];
  const pendingBookings = bookings.filter(booking => booking.status === 'pending');
  const pendingQuoteBookings = bookings.filter(booking => booking.status === 'pending');
  const quotedBookings = bookings.filter(booking => booking.status === 'quoted');
  const confirmedBookings = bookings.filter(booking => booking.status === 'confirmed');

  const activeVehicles = vehicles.filter(v => v.status === 'active');
  const availableDrivers = drivers.filter(d => d.status === 'available');
  const todayTrips = trips.filter(trip => 
    new Date(trip.scheduledTime).toDateString() === new Date().toDateString()
  );
  const completedTrips = trips.filter(trip => trip.status === 'completed');
  const totalRevenue = completedTrips.reduce((sum, trip) => sum + (trip.fare || 0), 0);

  const copyWidgetCode = () => {
    const frontendUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
    
    const widgetCode = `<div id="transport-booking-widget" 
       data-transport-widget 
       data-widget-id="${business?.widgetId}"
       data-button-text="Book a Ride"
       data-base-url="${frontendUrl}">
    </div>
    <script src="${frontendUrl}/widget.js"></script>`;
    
    navigator.clipboard.writeText(widgetCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'pending': return 'destructive';
      case 'scheduled': return 'default';
      case 'on-the-way': return 'secondary';
      case 'started': return 'secondary';
      case 'completed': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Business Dashboard</h1>
        <div className="flex items-center gap-2">
          {/* Widget Quick Access */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Get Widget
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Booking Widget</DialogTitle>
                <DialogDescription>
                  Embed this code on your website to allow customers to book rides
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <code className="text-sm text-gray-800 whitespace-pre-wrap">
{`<!-- Auto-init Transport Widget -->
<div id="transport-booking-widget" 
     data-transport-widget 
     data-widget-id="${business?.widgetId}"
     data-button-text="Book a Ride"
     data-base-url="${import.meta.env.VITE_FRONTEND_URL || window.location.origin}">
</div>
<script src="${import.meta.env.VITE_FRONTEND_URL || window.location.origin}/widget.js"></script>`}
                  </code>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={copyWidgetCode}>
                    <Copy className="h-4 w-4 mr-2" />
                    {copied ? 'Copied!' : 'Copy Code'}
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <a href={`/widget/${business?.widgetId}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Preview Widget
                    </a>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <a href="/business/settings">
                      More Options
                    </a>
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {pendingTrips.length > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {pendingTrips.length} Pending Assignments
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeVehicles.length}</div>
            <p className="text-xs text-muted-foreground">
              {vehicles.length} total vehicles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Drivers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableDrivers.length}</div>
            <p className="text-xs text-muted-foreground">
              {drivers.length} total drivers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Trips</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayTrips.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingTrips.length} pending assignment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue}</div>
            <p className="text-xs text-muted-foreground">
              {completedTrips.length} completed trips
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Widget Bookings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Widget Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingBookings.length === 0 ? (
            <p className="text-muted-foreground">No pending widget bookings</p>
          ) : (
            <div className="space-y-3">
              {pendingBookings.slice(0, 5).map((booking) => (
                <div key={booking._id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">
                      {booking.customerInfo?.name || booking.passenger?.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {booking.origin} → {booking.destination}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(booking.scheduledTime).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-600">${booking.fare}</div>
                    <Badge variant="secondary">Widget</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Quote Requests */}
      {pendingQuoteBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Pending Quote Requests
            </CardTitle>
            <CardDescription>
              New bookings waiting for your quote
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingQuoteBookings.map((booking) => (
                <div key={booking._id} className="flex items-center justify-between p-3 border rounded bg-orange-50">
                  <div>
                    <div className="font-medium">
                      {booking.customerInfo?.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {booking.origin} → {booking.destination}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(booking.scheduledTime).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {booking.passengerCount} passenger(s) • {booking.customerInfo?.vehicleType}
                    </div>
                  </div>
                  <Button
                    onClick={() => setSelectedBookingForQuote(booking)}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Send Quote
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quoted Bookings Awaiting Confirmation */}
      {quotedBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Awaiting Customer Confirmation
            </CardTitle>
            <CardDescription>
              Quotes sent, waiting for customer response
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quotedBookings.map((booking) => (
                <div key={booking._id} className="flex items-center justify-between p-3 border rounded bg-blue-50">
                  <div>
                    <div className="font-medium">
                      {booking.customerInfo?.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {booking.origin} → {booking.destination}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Quoted: ${booking.proposedFare} • {new Date(booking.quotedAt).toLocaleString()}
                    </div>
                  </div>
                  <Badge variant="secondary">Quote Sent</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmed Bookings Ready for Driver Assignment */}
      {confirmedBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Ready for Driver Assignment
            </CardTitle>
            <CardDescription>
              Confirmed bookings waiting for driver assignment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {confirmedBookings.map((booking) => (
                <div key={booking._id} className="flex items-center justify-between p-3 border rounded bg-green-50">
                  <div>
                    <div className="font-medium">
                      {booking.customerInfo?.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {booking.origin} → {booking.destination}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Confirmed: ${booking.fare} • {new Date(booking.confirmedAt).toLocaleString()}
                    </div>
                  </div>
                  <Button
                    onClick={() => setSelectedTrip(booking)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Assign Driver
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Trip Assignments */}
      {pendingTrips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Pending Trip Assignments
            </CardTitle>
            <CardDescription>
              These trips need driver and vehicle assignment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTrips.map((trip) => (
                <div key={trip._id} className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">{trip.from} → {trip.to}</span>
                      <Badge variant="destructive">Pending</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Passenger: {trip.passenger?.name || 'Unknown'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Scheduled: {new Date(trip.scheduledTime).toLocaleString()}
                    </div>
                    {trip.fare && (
                      <div className="text-sm font-medium text-green-600">
                        Fare: ${trip.fare}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => setSelectedTrip(trip)}
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Assign Driver
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Trips */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Trips</CardTitle>
          <CardDescription>Latest trip activity</CardDescription>
        </CardHeader>
        <CardContent>
          {trips.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No trips yet</p>
          ) : (
            <div className="space-y-4">
              {trips.slice(0, 5).map((trip) => (
                <div key={trip._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">{trip.from} → {trip.to}</span>
                      <Badge variant={getStatusBadgeVariant(trip.status)}>
                        {trip.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Driver: {trip.driver?.name || 'Unassigned'} | 
                      Vehicle: {trip.vehicle?.licensePlate || 'Unassigned'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(trip.scheduledTime).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    {trip.fare && (
                      <div className="font-medium text-green-600">${trip.fare}</div>
                    )}
                    {trip.status === 'completed' && (
                      <CheckCircle className="h-4 w-4 text-green-500 ml-auto mt-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trip Assignment Dialog */}
      {selectedTrip && (
        <TripAssignmentDialog
          trip={selectedTrip}
          drivers={drivers}
          vehicles={vehicles}
          onClose={() => setSelectedTrip(null)}
        />
      )}

      <QuoteDialog
        booking={selectedBookingForQuote}
        isOpen={!!selectedBookingForQuote}
        onClose={() => setSelectedBookingForQuote(null)}
      />
    </div>
  );
}
