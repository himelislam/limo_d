import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Car, Users, MapPin, DollarSign, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { getVehicles } from '@/api/vehicles';
import { getTrips, getPendingTrips } from '@/api/trips';
import { getDrivers } from '@/api/drivers';
import TripAssignmentDialog from '@/components/TripAssignmentDialog';

export default function OwnerDashboard() {
  const [selectedTrip, setSelectedTrip] = useState(null);

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

  const { data: pendingRes = [] } = useQuery({
    queryKey: ['pending-trips'],
    queryFn: getPendingTrips,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  const pendingTrips = pendingRes?.data ?? [];

  const { data: driverRes = [] } = useQuery({
    queryKey: ['owner-drivers'],
    queryFn: getDrivers,
  });
  const drivers = driverRes?.data ?? [];

  const revenue = (trips || []).filter(trip => trip?.status === 'completed')
    .reduce((sum, trip) => sum + (trip?.fare || 0), 0);

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

      {/* Pending Trips Section */}
      {pendingTrips.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-5 w-5" />
              Pending Trip Requests ({pendingTrips.length})
            </CardTitle>
            <CardDescription className="text-orange-700">
              New trip requests waiting for driver and vehicle assignment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTrips.map((trip) => (
                <Card key={trip._id} className="bg-white border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{trip.origin} → {trip.destination}</span>
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            Pending
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Passenger:</span>
                            <p>{trip.passenger?.name}</p>
                            <p className="text-xs">{trip.passenger?.email}</p>
                          </div>
                          <div>
                            <span className="font-medium">Scheduled:</span>
                            <p>{new Date(trip.scheduledTime).toLocaleDateString()}</p>
                            <p className="text-xs">{new Date(trip.scheduledTime).toLocaleTimeString()}</p>
                          </div>
                          <div>
                            <span className="font-medium">Passengers:</span>
                            <p className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {trip.passengerCount}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Requested:</span>
                            <p>{new Date(trip.createdAt).toLocaleDateString()}</p>
                            <p className="text-xs">{new Date(trip.createdAt).toLocaleTimeString()}</p>
                          </div>
                        </div>

                        {trip.vehicle && (
                          <div className="text-sm">
                            <span className="font-medium text-blue-600">Pre-selected Vehicle:</span>
                            <span className="ml-2">{trip.vehicle.make} {trip.vehicle.model} ({trip.vehicle.licensePlate})</span>
                          </div>
                        )}

                        {trip.driver && (
                          <div className="text-sm">
                            <span className="font-medium text-green-600">Assigned Driver:</span>
                            <span className="ml-2">{trip.driver.name} ({trip.driver.phone})</span>
                          </div>
                        )}

                        {trip.notes && (
                          <div className="text-sm">
                            <span className="font-medium">Notes:</span>
                            <p className="text-gray-600 mt-1">{trip.notes}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4">
                        <Button 
                          onClick={() => setSelectedTrip(trip)}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Assign
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
                    vehicle.status === 'active' ? 'text-green-600' : 
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
                    <p className="font-medium">{trip.origin || trip.from} → {trip.destination || trip.to}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(trip.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${trip.fare || 'N/A'}</p>
                    <Badge variant={getStatusBadgeVariant(trip.status)} className="text-xs">
                      {trip.status.replace('_', ' ').replace('-', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <TripAssignmentDialog 
        trip={selectedTrip}
        isOpen={!!selectedTrip}
        onClose={() => setSelectedTrip(null)}
      />
    </div>
  );
}
