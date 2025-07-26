import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, DollarSign, CheckCircle, Navigation, Play, Square } from 'lucide-react';
import { getMyTrips, updateTripStatus } from '@/api/trips';
import { useAuth } from '@/contexts/AuthContext';

export default function DriverDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: tripsRes = [] } = useQuery({
    queryKey: ['my-trips'],
    queryFn: getMyTrips,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  const trips = tripsRes.data ?? [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ tripId, status }) => updateTripStatus(tripId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-trips']);
    },
  });

  const scheduledTrips = trips.filter(trip => trip.status === 'scheduled');
  const activeTrips = trips.filter(trip => ['on-the-way', 'started'].includes(trip.status));
  const todayTrips = trips.filter(trip => 
    new Date(trip.scheduledTime).toDateString() === new Date().toDateString()
  );
  const completedTrips = trips.filter(trip => trip.status === 'completed');

  const totalEarnings = completedTrips.reduce((sum, trip) => sum + (trip.fare || 0), 0);

  const handleStatusUpdate = (tripId, newStatus) => {
    updateStatusMutation.mutate({ tripId, status: newStatus });
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'scheduled': return 'secondary';
      case 'on-the-way': return 'default';
      case 'started': return 'destructive';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const stats = [
    {
      title: 'Scheduled Trips',
      value: scheduledTrips.length,
      description: 'Upcoming assignments',
      icon: Clock,
      color: 'text-blue-600',
    },
    {
      title: 'Active Trips',
      value: activeTrips.length,
      description: 'Currently in progress',
      icon: Navigation,
      color: 'text-green-600',
    },
    {
      title: 'Today\'s Trips',
      value: todayTrips.length,
      description: 'Trips scheduled today',
      icon: MapPin,
      color: 'text-purple-600',
    },
    {
      title: 'Total Earnings',
      value: `$${totalEarnings.toFixed(2)}`,
      description: 'From completed trips',
      icon: DollarSign,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Driver Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}! Here are your trip assignments.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Active Trips */}
      {activeTrips.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Navigation className="h-5 w-5" />
              Active Trips ({activeTrips.length})
            </CardTitle>
            <CardDescription className="text-green-700">
              Trips currently in progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeTrips.map((trip) => (
                <Card key={trip._id} className="bg-white border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{trip.origin} → {trip.destination}</span>
                          <Badge variant={getStatusBadgeVariant(trip.status)}>
                            {trip.status.replace('-', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Passenger:</span>
                            <p>{trip.passenger?.name}</p>
                            <p className="text-xs">{trip.passenger?.phone}</p>
                          </div>
                          <div>
                            <span className="font-medium">Vehicle:</span>
                            <p>{trip.vehicle?.make} {trip.vehicle?.model}</p>
                            <p className="text-xs">{trip.vehicle?.licensePlate}</p>
                          </div>
                          <div>
                            <span className="font-medium">Fare:</span>
                            <p className="text-green-600 font-semibold">${trip.fare}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4 flex gap-2">
                        {trip.status === 'on-the-way' && (
                          <Button 
                            onClick={() => handleStatusUpdate(trip._id, 'started')}
                            className="bg-blue-600 hover:bg-blue-700"
                            size="sm"
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Start Trip
                          </Button>
                        )}
                        {trip.status === 'started' && (
                          <Button 
                            onClick={() => handleStatusUpdate(trip._id, 'completed')}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scheduled Trips */}
      {scheduledTrips.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Clock className="h-5 w-5" />
              Scheduled Trips ({scheduledTrips.length})
            </CardTitle>
            <CardDescription className="text-blue-700">
              Your upcoming trip assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scheduledTrips.map((trip) => (
                <Card key={trip._id} className="bg-white border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{trip.origin} → {trip.destination}</span>
                          <Badge variant={getStatusBadgeVariant(trip.status)}>
                            {trip.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Passenger:</span>
                            <p>{trip.passenger?.name}</p>
                            <p className="text-xs">{trip.passenger?.phone}</p>
                          </div>
                          <div>
                            <span className="font-medium">Scheduled:</span>
                            <p>{new Date(trip.scheduledTime).toLocaleDateString()}</p>
                            <p className="text-xs">{new Date(trip.scheduledTime).toLocaleTimeString()}</p>
                          </div>
                          <div>
                            <span className="font-medium">Vehicle:</span>
                            <p>{trip.vehicle?.make} {trip.vehicle?.model}</p>
                            <p className="text-xs">{trip.vehicle?.licensePlate}</p>
                          </div>
                          <div>
                            <span className="font-medium">Fare:</span>
                            <p className="text-green-600 font-semibold">${trip.fare}</p>
                          </div>
                        </div>

                        {trip.assignmentNotes && (
                          <div className="text-sm">
                            <span className="font-medium">Notes:</span>
                            <p className="text-gray-600 mt-1">{trip.assignmentNotes}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4">
                        <Button 
                          onClick={() => handleStatusUpdate(trip._id, 'on-the-way')}
                          className="bg-blue-600 hover:bg-blue-700"
                          size="sm"
                        >
                          <Navigation className="mr-2 h-4 w-4" />
                          Start Journey
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Completed Trips */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Completed Trips</CardTitle>
          <CardDescription>Your latest completed trips and earnings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {completedTrips.slice(0, 5).map((trip) => (
              <div key={trip._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{trip.origin} → {trip.destination}</p>
                  <p className="text-sm text-muted-foreground">
                    Passenger: {trip.passenger?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Completed: {new Date(trip.endTime || trip.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">${trip.fare}</p>
                  <Badge variant="outline">Completed</Badge>
                </div>
              </div>
            ))}
            {completedTrips.length === 0 && (
              <p className="text-muted-foreground text-center py-4">No completed trips yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
