import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, DollarSign, CheckCircle, Play, Square, User } from 'lucide-react';
import { getDriverTrips, updateTripStatus } from '@/api/trips';
import { useAuth } from '@/contexts/AuthContext';

export default function DriverTrips() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tripsRes, isLoading } = useQuery({
    queryKey: ['driver-trips'],
    queryFn: getDriverTrips,
  });

  // Handle the API response structure properly
  const trips = tripsRes?.data || tripsRes || [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ tripId, status }) => updateTripStatus(tripId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['driver-trips']);
    },
  });

  const scheduledTrips = trips.filter(trip => ['scheduled', 'driver-assigned', 'confirmed'].includes(trip.status));
  const activeTrips = trips.filter(trip => ['on-the-way', 'started', 'in-progress'].includes(trip.status));
  const completedTrips = trips.filter(trip => trip.status === 'completed');
  const todayTrips = trips.filter(trip => 
    new Date(trip.scheduledTime).toDateString() === new Date().toDateString()
  );

  const totalEarnings = completedTrips.reduce((sum, trip) => sum + (trip.fare || 0), 0);

  const stats = [
    {
      title: 'Today\'s Trips',
      value: todayTrips.length,
      description: 'Trips scheduled for today',
      icon: Clock,
      color: 'text-blue-600',
    },
    {
      title: 'Active Trips',
      value: activeTrips.length,
      description: 'Currently in progress',
      icon: Play,
      color: 'text-orange-600',
    },
    {
      title: 'Completed',
      value: completedTrips.length,
      description: 'All time completed',
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      title: 'Total Earnings',
      value: `$${totalEarnings.toFixed(2)}`,
      description: 'From completed trips',
      icon: DollarSign,
      color: 'text-purple-600',
    },
  ];

  const handleStartTrip = (tripId) => {
    updateStatusMutation.mutate({
      tripId,
      status: 'on-the-way'
    });
  };

  const handleCompleteTrip = (tripId) => {
    updateStatusMutation.mutate({
      tripId,
      status: 'completed'
    });
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'scheduled': return 'secondary';
      case 'driver-assigned': return 'secondary';
      case 'confirmed': return 'secondary';
      case 'on-the-way': return 'default';
      case 'started': return 'default';
      case 'in-progress': return 'default';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getNextAction = (trip) => {
    switch (trip.status) {
      case 'driver-assigned':
      case 'scheduled':
      case 'confirmed':
        return { label: 'Start Trip', action: 'on-the-way', icon: Play };
      case 'on-the-way':
        return { label: 'Pick Up Passenger', action: 'started', icon: User };
      case 'started':
      case 'in-progress':
        return { label: 'Complete Trip', action: 'completed', icon: CheckCircle };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Trips</h1>
        <p className="text-muted-foreground">Manage your assigned trips and track earnings</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
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
            <CardTitle>Scheduled Trips</CardTitle>
            <CardDescription>Upcoming trips assigned to you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scheduledTrips.length === 0 ? (
                <p className="text-muted-foreground">No scheduled trips</p>
              ) : (
                scheduledTrips.map((trip) => {
                  const nextAction = getNextAction(trip);
                  return (
                    <div key={trip._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">
                          {trip.origin || trip.from} → {trip.destination || trip.to}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Passenger: {trip.passenger?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Fare: ${trip.fare || 'N/A'}
                        </p>
                        {trip.scheduledTime && (
                          <p className="text-sm text-muted-foreground">
                            Time: {new Date(trip.scheduledTime).toLocaleString()}
                          </p>
                        )}
                        {trip.notes && (
                          <p className="text-sm text-muted-foreground">
                            Notes: {trip.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Badge variant="secondary">{trip.status}</Badge>
                        {nextAction && (
                          <Button
                            size="sm"
                            onClick={() => updateStatusMutation.mutate({
                              tripId: trip._id,
                              status: nextAction.action
                            })}
                            disabled={updateStatusMutation.isPending}
                          >
                            <nextAction.icon className="mr-1 h-3 w-3" />
                            {nextAction.label}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Trips</CardTitle>
            <CardDescription>Trips currently in progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeTrips.length === 0 ? (
                <p className="text-muted-foreground">No active trips</p>
              ) : (
                activeTrips.map((trip) => {
                  const nextAction = getNextAction(trip);
                  return (
                    <div key={trip._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">
                          {trip.origin || trip.from} → {trip.destination || trip.to}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Passenger: {trip.passenger?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Fare: ${trip.fare || 'N/A'}
                        </p>
                        {trip.scheduledTime && (
                          <p className="text-sm text-muted-foreground">
                            Scheduled: {new Date(trip.scheduledTime).toLocaleString()}
                          </p>
                        )}
                        {trip.notes && (
                          <p className="text-sm text-muted-foreground">
                            Notes: {trip.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Badge variant="default">In Progress</Badge>
                        {nextAction && (
                          <Button
                            size="sm"
                            onClick={() => updateStatusMutation.mutate({
                              tripId: trip._id,
                              status: nextAction.action
                            })}
                            disabled={updateStatusMutation.isPending}
                          >
                            <nextAction.icon className="mr-1 h-3 w-3" />
                            {nextAction.label}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trip History</CardTitle>
          <CardDescription>All your trips and earnings</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Passenger</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fare</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trips.map((trip) => (
                  <TableRow key={trip._id}>
                    <TableCell className="font-medium">
                      {trip.origin || trip.from} → {trip.destination || trip.to}
                    </TableCell>
                    <TableCell>{trip.passenger?.name || 'Unknown'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(trip.status)}>
                        {trip.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>${trip.fare || 'N/A'}</TableCell>
                    <TableCell>
                      {new Date(trip.scheduledTime).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {trip.notes || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}