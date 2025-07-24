import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, MapPin, Clock, DollarSign, Car, Star } from 'lucide-react';
import { getTrips, addTripFeedback } from '@/api/trips';
import TripBookingDialog from '@/components/TripBookingDialog';
import TripFeedbackDialog from '@/components/TripFeedbackDialog';

export default function PassengerTrips() {
  const { user } = useAuth();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [feedbackTrip, setFeedbackTrip] = useState(null);

  const queryClient = useQueryClient();

  const { data: tripsRes = [], isLoading } = useQuery({
    queryKey: ['passenger-trips'],
    queryFn: getTrips,
  });

  const trips = tripsRes?.data ?? [];

  // Filter trips for current passenger
  const myTrips = trips.filter(trip => trip.passenger?._id === user._id || trip.passenger === user._id);

  const tripStats = {
    total: myTrips.length,
    pending: myTrips.filter(t => t.status === 'pending').length,
    scheduled: myTrips.filter(t => t.status === 'scheduled').length,
    inProgress: myTrips.filter(t => ['on-the-way', 'started'].includes(t.status)).length,
    completed: myTrips.filter(t => t.status === 'completed').length,
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'scheduled': return 'default';
      case 'on-the-way': return 'default';
      case 'started': return 'default';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'scheduled': return 'text-blue-600';
      case 'on-the-way': return 'text-orange-600';
      case 'started': return 'text-green-600';
      case 'completed': return 'text-gray-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  console.log(myTrips)
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Trips</h1>
          <p className="text-muted-foreground">Book and manage your trips</p>
        </div>
        <Button onClick={() => setIsBookingOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Book Trip
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tripStats.total}</div>
            <p className="text-xs text-muted-foreground">All your trips</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tripStats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting assignment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tripStats.scheduled}</div>
            <p className="text-xs text-muted-foreground">Ready to go</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Car className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tripStats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tripStats.completed}</div>
            <p className="text-xs text-muted-foreground">Finished trips</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Trips</CardTitle>
            <CardDescription>Your scheduled and pending trips</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myTrips
                .filter(trip => ['pending', 'scheduled', 'on-the-way', 'started'].includes(trip.status))
                .slice(0, 5)
                .map((trip) => (
                <div key={trip._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{trip.origin} → {trip.destination}</p>
                    <p className="text-sm text-muted-foreground">
                      {trip.scheduledTime ? new Date(trip.scheduledTime).toLocaleString() : 'Time TBD'}
                    </p>
                    {trip.driver && (
                      <p className="text-sm text-muted-foreground">
                        Driver: {trip.driver.name}
                      </p>
                    )}
                    {trip.vehicle && (
                      <p className="text-sm text-muted-foreground">
                        Vehicle: {trip.vehicle.type} ({trip.vehicle.licensePlate})
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${trip.fare || 'TBD'}</p>
                    <Badge variant={getStatusBadgeVariant(trip.status)} className="text-xs">
                      {trip.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
              {myTrips.filter(trip => ['pending', 'scheduled', 'on-the-way', 'started'].includes(trip.status)).length === 0 && (
                <p className="text-muted-foreground">No upcoming trips</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Trips</CardTitle>
            <CardDescription>Your latest completed trips</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myTrips
                .filter(trip => trip.status === 'completed')
                .sort((a, b) => new Date(b.endTime || b.createdAt) - new Date(a.endTime || a.createdAt))
                .slice(0, 5)
                .map((trip) => (
                <div key={trip._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{trip.origin} → {trip.destination}</p>
                    <p className="text-sm text-muted-foreground">
                      {trip.endTime ? new Date(trip.endTime).toLocaleDateString() : new Date(trip.createdAt).toLocaleDateString()}
                    </p>
                    {trip.driver && (
                      <p className="text-sm text-muted-foreground">
                        Driver: {trip.driver.name}
                      </p>
                    )}
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-medium">${trip.fare || 'N/A'}</p>
                    <div className="flex items-center gap-1">
                      {trip.rating ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{trip.rating}</span>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setFeedbackTrip(trip)}
                          className="text-xs h-6"
                        >
                          Rate
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {myTrips.filter(trip => trip.status === 'completed').length === 0 && (
                <p className="text-muted-foreground">No completed trips yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trip History</CardTitle>
          <CardDescription>Complete history of all your trips</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fare</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myTrips.map((trip) => (
                  <TableRow key={trip._id}>
                    <TableCell className="font-medium">
                      {trip.origin} → {trip.destination}
                    </TableCell>
                    <TableCell>{trip.driver?.name || 'Not assigned'}</TableCell>
                    <TableCell>
                      {trip.vehicle ? 
                        `${trip.vehicle.type} (${trip.vehicle.licensePlate})` : 
                        'Not assigned'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(trip.status)}>
                        {trip.status.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>${trip.fare || 'TBD'}</TableCell>
                    <TableCell>
                      {trip.scheduledTime ? new Date(trip.scheduledTime).toLocaleDateString() : new Date(trip.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {trip.rating ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{trip.rating}</span>
                        </div>
                      ) : trip.status === 'completed' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setFeedbackTrip(trip)}
                        >
                          Rate
                        </Button>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {myTrips.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No trips found. Book your first trip!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <TripBookingDialog 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
      />

      <TripFeedbackDialog 
        trip={feedbackTrip}
        isOpen={!!feedbackTrip}
        onClose={() => setFeedbackTrip(null)}
      />
    </div>
  );
}
