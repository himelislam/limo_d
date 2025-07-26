import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Plus, Car } from 'lucide-react';
import { getTrips, createTrip } from '@/api/trips';
import { getVehicles } from '@/api/vehicles';
import { useAuth } from '@/contexts/AuthContext';

export default function PassengerDashboard() {
  const { user } = useAuth();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    from: '',
    to: '',
    scheduledTime: '',
    notes: '',
  });

  const queryClient = useQueryClient();

  const { data: tripsRes = []} = useQuery({
    queryKey: ['passenger-trips'],
    queryFn: getTrips,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const trips = tripsRes?.data ?? [];

  const { data: vehiclesRes = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: getVehicles,
  });

  const vehicles = vehiclesRes?.data ?? [];

  const myTrips = trips.filter(trip => trip.passenger === user?.id);
  const upcomingTrips = myTrips.filter(trip => 
    ['pending', 'scheduled', 'on-the-way', 'started'].includes(trip.status)
  );
  const completedTrips = myTrips.filter(trip => trip.status === 'completed');

  const bookTripMutation = useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      queryClient.invalidateQueries(['passenger-trips']);
      setIsBookingOpen(false);
      setBookingData({ from: '', to: '', scheduledTime: '', notes: '' });
    },
  });

  const handleBookTrip = (e) => {
    e.preventDefault();
    bookTripMutation.mutate({
      ...bookingData,
      passenger: user.id,
      status: 'scheduled',
    });
  };

  const stats = [
    {
      title: 'Upcoming Trips',
      value: upcomingTrips.length,
      description: 'Scheduled and active trips',
      icon: Clock,
      color: 'text-blue-600',
    },
    {
      title: 'Completed Trips',
      value: completedTrips.length,
      description: 'All time completed',
      icon: MapPin,
      color: 'text-green-600',
    },
    {
      title: 'Available Vehicles',
      value: vehicles.filter(v => v.status === 'available').length,
      description: 'Ready for booking',
      icon: Car,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Passenger Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Book your next trip or view your travel history.
          </p>
        </div>
        <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Book Trip
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Book a New Trip</DialogTitle>
              <DialogDescription>
                Schedule your next journey with us
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleBookTrip}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="from" className="text-right">From</Label>
                  <Input
                    id="from"
                    value={bookingData.from}
                    onChange={(e) => setBookingData({ ...bookingData, from: e.target.value })}
                    className="col-span-3"
                    placeholder="Pickup location"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="to" className="text-right">To</Label>
                  <Input
                    id="to"
                    value={bookingData.to}
                    onChange={(e) => setBookingData({ ...bookingData, to: e.target.value })}
                    className="col-span-3"
                    placeholder="Destination"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="scheduledTime" className="text-right">Date & Time</Label>
                  <Input
                    id="scheduledTime"
                    type="datetime-local"
                    value={bookingData.scheduledTime}
                    onChange={(e) => setBookingData({ ...bookingData, scheduledTime: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">Notes</Label>
                  <Input
                    id="notes"
                    value={bookingData.notes}
                    onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                    className="col-span-3"
                    placeholder="Special instructions (optional)"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={bookTripMutation.isLoading}>
                  Book Trip
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Trips</CardTitle>
            <CardDescription>Your scheduled and active trips</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTrips.length === 0 ? (
                <p className="text-muted-foreground">No upcoming trips</p>
              ) : (
                upcomingTrips.map((trip) => (
                  <div key={trip._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium">{trip.origin} → {trip.destination}</p>
                        <Badge variant={getStatusBadgeVariant(trip.status)}>
                          {trip.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {trip.scheduledTime ? new Date(trip.scheduledTime).toLocaleString() : 'Time TBD'}
                      </p>
                      {trip.driver && (
                        <div className="text-sm text-muted-foreground mt-1">
                          <span className="font-medium">Driver:</span> {trip.driver.name}
                          {trip.driver.phone && <span className="ml-2">📞 {trip.driver.phone}</span>}
                        </div>
                      )}
                      {trip.vehicle && (
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Vehicle:</span> {trip.vehicle.make} {trip.vehicle.model} ({trip.vehicle.licensePlate})
                        </div>
                      )}
                      {trip.fare && (
                        <div className="text-sm font-medium text-green-600 mt-1">
                          Fare: ${trip.fare}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      {trip.status === 'pending' && (
                        <Badge variant="secondary">Awaiting Assignment</Badge>
                      )}
                      {trip.status === 'scheduled' && (
                        <Badge variant="default">Confirmed</Badge>
                      )}
                      {trip.status === 'on-the-way' && (
                        <Badge variant="default" className="bg-blue-600">Driver En Route</Badge>
                      )}
                      {trip.status === 'started' && (
                        <Badge variant="destructive">Trip in Progress</Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trip History</CardTitle>
            <CardDescription>Your completed trips</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedTrips.slice(0, 5).map((trip) => (
                <div key={trip._id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{trip.from} → {trip.to}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(trip.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${trip.fare || 'N/A'}</p>
                    <Badge variant="outline" className="text-green-600">
                      Completed
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
