import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, DollarSign, CheckCircle, Navigation, Play, Square, User } from 'lucide-react';
import { getDriverTrips, updateTripStatus } from '@/api/trips';
import { useAuth } from '@/contexts/AuthContext';

export default function DriverDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: tripsRes = [], isLoading } = useQuery({
    queryKey: ['driver-trips'],
    queryFn: getDriverTrips,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  const trips = tripsRes.data ?? [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ tripId, status }) => updateTripStatus(tripId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['driver-trips']);
    },
  });

  const scheduledTrips = trips.filter(trip => trip.status === 'scheduled');
  const activeTrips = trips.filter(trip => ['on-the-way', 'started'].includes(trip.status));
  const todayTrips = trips.filter(trip => 
    new Date(trip.scheduledTime).toDateString() === new Date().toDateString()
  );

  const handleStatusUpdate = (tripId, newStatus) => {
    updateStatusMutation.mutate({ tripId, status: newStatus });
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'scheduled': return 'default';
      case 'on-the-way': return 'secondary';
      case 'started': return 'destructive';
      case 'completed': return 'outline';
      default: return 'default';
    }
  };

  const getNextAction = (trip) => {
    switch (trip.status) {
      case 'scheduled':
        return { label: 'Start Trip', action: 'on-the-way', icon: Play };
      case 'on-the-way':
        return { label: 'Pick Up Passenger', action: 'started', icon: User };
      case 'started':
        return { label: 'Complete Trip', action: 'completed', icon: CheckCircle };
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Driver Dashboard</h1>
        <Badge variant="outline" className="text-lg px-3 py-1">
          Welcome, {user?.name}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Trips</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayTrips.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trips</CardTitle>
            <Navigation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTrips.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledTrips.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${trips.filter(t => t.status === 'completed').reduce((sum, t) => sum + (t.fare || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Trips */}
      {activeTrips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Trips</CardTitle>
            <CardDescription>Trips currently in progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeTrips.map((trip) => {
                const nextAction = getNextAction(trip);
                return (
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
                        Passenger: {trip.passenger?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Scheduled: {new Date(trip.scheduledTime).toLocaleString()}
                      </div>
                    </div>
                    {nextAction && (
                      <Button
                        onClick={() => handleStatusUpdate(trip._id, nextAction.action)}
                        disabled={updateStatusMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        <nextAction.icon className="h-4 w-4" />
                        {nextAction.label}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scheduled Trips */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Trips</CardTitle>
          <CardDescription>Upcoming trips assigned to you</CardDescription>
        </CardHeader>
        <CardContent>
          {scheduledTrips.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No scheduled trips</p>
          ) : (
            <div className="space-y-4">
              {scheduledTrips.map((trip) => {
                const nextAction = getNextAction(trip);
                return (
                  <div key={trip._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="font-medium">{trip.from} → {trip.to}</span>
                        <Badge variant={getStatusBadgeVariant(trip.status)}>
                          {trip.status}
                        </Badge>
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
                    {nextAction && (
                      <Button
                        onClick={() => handleStatusUpdate(trip._id, nextAction.action)}
                        disabled={updateStatusMutation.isPending}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <nextAction.icon className="h-4 w-4" />
                        {nextAction.label}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
