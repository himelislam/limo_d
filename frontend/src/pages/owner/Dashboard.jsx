import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Users, MapPin, DollarSign } from 'lucide-react';
import { getVehicles } from '@/api/vehicles';
import { getTrips } from '@/api/trips';
import { getDrivers } from '@/api/drivers';

export default function OwnerDashboard() {
  const { data: vehicleRes = [] } = useQuery({
    queryKey: ['owner-vehicles'],
    queryFn: getVehicles,
  });
  const vehicles = vehicleRes?.data ?? [];


  const { data: tripRes = [] } = useQuery({
    queryKey: ['owner-trips'],
    queryFn: getTrips,
  });
  const trips = tripRes?.data ?? [];


  const { data: driverRes = [] } = useQuery({
    queryKey: ['owner-drivers'],
    queryFn: getDrivers,
  });
  const drivers = driverRes?.data ?? [];


  const revenue = (trips || []).filter(trip => trip?.status === 'completed')
  .reduce((sum, trip) => sum + (trip?.fare || 0), 0);


    console.log(vehicles, 'vehicles from dashboard')
  const stats = [
    {
      title: 'My Vehicles',
      value: vehicles.length,
      description: 'Total fleet size',
      icon: Car,
      color: 'text-blue-600',
    },
    {
      title: 'My Drivers',
      value: drivers.length,
      description: 'Active drivers',
      icon: Users,
      color: 'text-green-600',
    },
    {
      title: 'Total Trips',
      value: trips.length,
      description: 'All time trips',
      icon: MapPin,
      color: 'text-purple-600',
    },
    {
      title: 'Revenue',
      value: `$${revenue.toFixed(2)}`,
      description: 'Total earnings',
      icon: DollarSign,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Owner Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your fleet and monitor performance
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
            <CardTitle>Vehicle Status</CardTitle>
            <CardDescription>Current status of your fleet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vehicles?.slice(0, 5).map((vehicle) => (
                <div key={vehicle._id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{vehicle.make} {vehicle.model}</p>
                    <p className="text-sm text-muted-foreground">
                      {vehicle.licensePlate}
                    </p>
                  </div>
                  <div className={`text-sm ${
                    vehicle.status === 'available' ? 'text-green-600' : 
                    vehicle.status === 'in_use' ? 'text-blue-600' : 'text-yellow-600'
                  }`}>
                    {vehicle.status.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Trips</CardTitle>
            <CardDescription>Latest trips from your fleet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trips?.slice(0, 5).map((trip) => (
                <div key={trip._id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{trip.from} → {trip.to}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(trip.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${trip.fare || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">{trip.status}</p>
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