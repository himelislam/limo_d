import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { getTrips } from '@/api/trips';

export default function AdminTrips() {
  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['admin-trips'],
    queryFn: getTrips,
  });

  const tripStats = {
    total: trips.length,
    scheduled: trips.filter(t => t.status === 'scheduled').length,
    inProgress: trips.filter(t => t.status === 'in_progress').length,
    completed: trips.filter(t => t.status === 'completed').length,
  };

  const totalRevenue = trips
    .filter(t => t.status === 'completed')
    .reduce((sum, trip) => sum + (trip.fare || 0), 0);

  const stats = [
    {
      title: 'Total Trips',
      value: tripStats.total,
      description: 'All time trips',
      icon: MapPin,
      color: 'text-blue-600',
    },
    {
      title: 'In Progress',
      value: tripStats.inProgress,
      description: 'Currently active',
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
        <h1 className="text-3xl font-bold tracking-tight">Trips</h1>
        <p className="text-muted-foreground">Monitor all trips across the platform</p>
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

      <Card>
        <CardHeader>
          <CardTitle>All Trips</CardTitle>
          <CardDescription>Complete trip history and current trips</CardDescription>
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