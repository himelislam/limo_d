import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Car, MapPin, TrendingUp } from 'lucide-react';
import { getVehicles } from '@/api/vehicles';
import { getTrips } from '@/api/trips';
import { getDrivers } from '@/api/drivers';

export default function AdminDashboard() {
  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: getVehicles,
  });

  const { data: trips = [] } = useQuery({
    queryKey: ['trips'],
    queryFn: getTrips,
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers'],
    queryFn: getDrivers,
  });

  const stats = [
    {
      title: 'Total Vehicles',
      value: vehicles.length,
      description: 'Active fleet vehicles',
      icon: Car,
      color: 'text-blue-600',
    },
    {
      title: 'Total Drivers',
      value: drivers.length,
      description: 'Registered drivers',
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
      title: 'Active Trips',
      value: trips.filter(trip => trip.status === 'in_progress').length,
      description: 'Currently ongoing',
      icon: TrendingUp,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your fleet management system
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Trips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trips.slice(0, 5).map((trip) => (
                <div key={trip._id} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {trip.from} → {trip.to}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Status: {trip.status}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    ${trip.fare}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Vehicle Status</CardTitle>
            <CardDescription>
              Current status of your fleet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vehicles.slice(0, 5).map((vehicle) => (
                <div key={vehicle._id} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {vehicle.make} {vehicle.model}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {vehicle.licensePlate}
                    </p>
                  </div>
                  <div className={`ml-auto text-sm ${
                    vehicle.status === 'available' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {vehicle.status}
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