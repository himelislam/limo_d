import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, MapPin, Clock, DollarSign, Car } from 'lucide-react';
import { getTrips, createTrip } from '@/api/trips';

export default function PassengerTrips() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    date: '',
    time: '',
    passengers: 1,
  });

  const queryClient = useQueryClient();

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['passenger-trips'],
    queryFn: getTrips,
  });

  const createMutation = useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      queryClient.invalidateQueries(['passenger-trips']);
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setFormData({
      from: '',
      to: '',
      date: '',
      time: '',
      passengers: 1,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const tripData = {
      ...formData,
      passenger: user.id,
      status: 'scheduled',
    };
    createMutation.mutate(tripData);
  };

  // Filter trips for current passenger
  const myTrips = trips.filter(trip => trip.passenger?._id === user.id || trip.passenger === user.id);

  const tripStats = {
    total: myTrips.length,
    scheduled: myTrips.filter(t => t.status === 'scheduled').length,
    inProgress: myTrips.filter(t => t.status === 'in_progress').length,
    completed: myTrips.filter(t => t.status === 'completed').length,
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'scheduled': return 'outline';
      case 'in_progress': return 'default';
      case 'completed': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Trips</h1>
          <p className="text-muted-foreground">Book and manage your trips</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Book Trip
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Book New Trip</DialogTitle>
              <DialogDescription>
                Enter your trip details to book a ride
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="from" className="text-right">From</Label>
                  <Input
                    id="from"
                    value={formData.from}
                    onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                    className="col-span-3"
                    placeholder="Starting location"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="to" className="text-right">To</Label>
                  <Input
                    id="to"
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                    className="col-span-3"
                    placeholder="Destination"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="time" className="text-right">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="passengers" className="text-right">Passengers</Label>
                  <Input
                    id="passengers"
                    type="number"
                    min="1"
                    max="8"
                    value={formData.passengers}
                    onChange={(e) => setFormData({ ...formData, passengers: parseInt(e.target.value) })}
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isLoading}>
                  Book Trip
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tripStats.scheduled}</div>
            <p className="text-xs text-muted-foreground">Upcoming trips</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Car className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tripStats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Currently traveling</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
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
            <CardDescription>Your scheduled trips</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myTrips
                .filter(trip => trip.status === 'scheduled')
                .slice(0, 5)
                .map((trip) => (
                <div key={trip._id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{trip.from} → {trip.to}</p>
                    <p className="text-sm text-muted-foreground">
                      {trip.date ? new Date(trip.date).toLocaleDateString() : 'Date TBD'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${trip.fare || 'TBD'}</p>
                    <Badge variant={getStatusBadgeVariant(trip.status)} className="text-xs">
                      {trip.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {myTrips.filter(trip => trip.status === 'scheduled').length === 0 && (
                <p className="text-sm text-muted-foreground">No upcoming trips</p>
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
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
                .map((trip) => (
                <div key={trip._id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{trip.from} → {trip.to}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(trip.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${trip.fare || 'N/A'}</p>
                    <Badge variant={getStatusBadgeVariant(trip.status)} className="text-xs">
                      {trip.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {myTrips.filter(trip => trip.status === 'completed').length === 0 && (
                <p className="text-sm text-muted-foreground">No completed trips yet</p>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {myTrips.map((trip) => (
                  <TableRow key={trip._id}>
                    <TableCell className="font-medium">
                      {trip.from} → {trip.to}
                    </TableCell>
                    <TableCell>{trip.driver?.name || 'Not assigned'}</TableCell>
                    <TableCell>
                      {trip.vehicle ? 
                        `${trip.vehicle.make} ${trip.vehicle.model}` : 
                        'Not assigned'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(trip.status)}>
                        {trip.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>${trip.fare || 'TBD'}</TableCell>
                    <TableCell>
                      {new Date(trip.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {myTrips.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No trips found. Book your first trip!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}