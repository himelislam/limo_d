import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { getTrips } from '@/api/trips';
import { useAuth } from '@/contexts/AuthContext';

export default function DriverDashboard() {
  const { user } = useAuth();
  
  const { data: tripsRes = [] } = useQuery({
    queryKey: ['driver-trips'],
    queryFn: getTrips,
  });
  const trips = tripsRes.data ?? [];

  const myTrips = trips.filter(trip => trip.driver === user?.id);
  const todayTrips = myTrips.filter(trip => 
    new Date(trip.createdAt).toDateString() === new Date().toDateString()
  );
  const activeTrips = myTrips.filter(trip => trip.status === 'in_progress');
  const completedTrips = myTrips.filter(trip => trip.status === 'completed');
  const totalEarnings = completedTrips.reduce((sum, trip) => sum + (trip.fare || 0), 0);

  const stats = [
    {
      title: 'Today\'s Trips',
      value: todayTrips.length,
      description: 'Trips scheduled for today',
      icon: MapPin,
      color: 'text-blue-600',
    },
    {
      title: 'Active Trips',
      value: activeTrips.length,
      description: 'Currently in progress',
      icon: Clock,
      color: 'text-orange-600',
    },
    {
      title: 'Completed Trips',
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Driver Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}! Here's your trip overview.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <CardTitle>Active Trips</CardTitle>
            <CardDescription>Trips currently in progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeTrips.length === 0 ? (
                <p className="text-muted-foreground">No active trips</p>
              ) : (
                activeTrips.map((trip) => (
                  <div key={trip._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{trip.from} → {trip.to}</p>
                      <p className="text-sm text-muted-foreground">
                        Passenger: {trip.passenger?.name || 'Unknown'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Started: {new Date(trip.startTime).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge variant="secondary">In Progress</Badge>
                  </div>
                ))
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
              {completedTrips.slice(0, 5).map((trip) => (
                <div key={trip._id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{trip.from} → {trip.to}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(trip.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${trip.fare}</p>
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