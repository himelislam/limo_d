import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, DollarSign, CheckCircle, TrendingUp } from 'lucide-react';
import { getTrips } from '@/api/trips';

export default function OwnerTrips() {
  const { data: tripRes = [], isLoading } = useQuery({
    queryKey: ['owner-trips'],
    queryFn: getTrips,
  });
  const trips = tripRes?.data ?? [];


  const tripStats = {
    total: trips.length,
    scheduled: trips.filter(t => t.status === 'scheduled').length,
    inProgress: trips.filter(t => t.status === 'in_progress').length,
    completed: trips.filter(t => t.status === 'completed').length,
  };

  const totalRevenue = trips
    .filter(t => t.status === 'completed')
    .reduce((sum, trip) => sum + (trip.fare || 0), 0);

  const todayTrips = trips.filter(trip => 
    new Date(trip.createdAt).toDateString() === new Date().toDateString()
  );

  const stats = [
    {
      title: 'Total Trips',
      value: tripStats.total,
      description: 'All time trips',
      icon: MapPin,
      color: 'text-blue-600',
    },
    {
      title: 'Today\'s Trips',
      value: todayTrips.length,
      description: 'Trips today',
      icon: Clock,
      color: 'text-orange-600',
    },
    {
      title: 'Completed',
      value: tripStats.completed,
      description: 'Successfully finished',
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      description: 'From completed trips',
      icon: DollarSign,
      color: 'text-purple-600',
    },
  ];

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'scheduled': return 'secondary';
      case 'in_progress': return 'default';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Fleet Trips</h1>
        <p className="text-muted-foreground">Monitor trips from your vehicles</p>
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
            <CardTitle>Active Trips</CardTitle>
            <CardDescription>Currently ongoing trips</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trips.filter(t => t.status === 'in_progress').length === 0 ? (
                <p className="text-muted-foreground">No active trips</p>
              ) : (
                trips.filter(t => t.status === 'in_progress').map((trip) => (
                  <div key={trip._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{trip.from} → {trip.to}</p>
                      <p className="text-sm text-muted-foreground">
                        Driver: {trip.driver?.name || 'Unassigned'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Passenger: {trip.passenger?.name || 'Unknown'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="default">In Progress</Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        ${trip.fare || 'N/A'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>Earnings by trip status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm">Completed Trips</span>
                </div>
                <span className="font-medium">${totalRevenue.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm">In Progress</span>
                </div>
                <span className="font-medium">
                  ${trips.filter(t => t.status === 'in_progress').reduce((sum, trip) => sum + (trip.fare || 0), 0).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm">Scheduled</span>
                </div>
                <span className="font-medium">
                  ${trips.filter(t => t.status === 'scheduled').reduce((sum, trip) => sum + (trip.fare || 0), 0).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Trips</CardTitle>
          <CardDescription>Complete trip history from your fleet</CardDescription>
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
                  <TableHead>Driver</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fare</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trips.map((trip) => (
                  <TableRow key={trip._id}>
                    <TableCell className="font-medium">
                      {trip.from} → {trip.to}
                    </TableCell>
                    <TableCell>{trip.passenger?.name || 'Unknown'}</TableCell>
                    <TableCell>{trip.driver?.name || 'Unassigned'}</TableCell>
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
                    <TableCell>${trip.fare || 'N/A'}</TableCell>
                    <TableCell>
                      {new Date(trip.createdAt).toLocaleDateString()}
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