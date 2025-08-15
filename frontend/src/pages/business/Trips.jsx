import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Clock, User, Car, DollarSign, Filter } from 'lucide-react';
import { getTrips, updateTripStatus, assignTripDriver } from '@/api/trips';
import { getDrivers } from '@/api/drivers';
import { getVehicles } from '@/api/vehicles';

export default function BusinessTrips() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTrip, setSelectedTrip] = useState(null);

  const queryClient = useQueryClient();

  const { data: tripsRes = [], isLoading } = useQuery({
    queryKey: ['business-trips'],
    queryFn: getTrips,
  });

  const { data: driversRes = [] } = useQuery({
    queryKey: ['business-drivers'],
    queryFn: getDrivers,
  });

  const { data: vehiclesRes = [] } = useQuery({
    queryKey: ['business-vehicles'],
    queryFn: getVehicles,
  });

  const trips = tripsRes?.data || [];
  const drivers = driversRes?.data || [];
  const vehicles = vehiclesRes?.data || [];

  const filteredTrips = statusFilter === 'all' 
    ? trips 
    : trips.filter(trip => trip.status === statusFilter);

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => updateTripStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['business-trips']);
    },
  });

  const assignDriverMutation = useMutation({
    mutationFn: ({ tripId, driverId, vehicleId }) => assignTripDriver(tripId, driverId, vehicleId),
    onSuccess: () => {
      queryClient.invalidateQueries(['business-trips']);
      setSelectedTrip(null);
    },
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'destructive';
      case 'scheduled': return 'secondary';
      case 'in-progress': return 'default';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trip Management</h1>
          <p className="text-gray-600">Monitor and manage all trips</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Trips</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredTrips.map((trip) => (
          <Card key={trip._id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {trip.origin} → {trip.destination}
                </CardTitle>
                <Badge variant={getStatusColor(trip.status)}>
                  {trip.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{new Date(trip.scheduledTime).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{trip.passenger?.name || 'Unknown'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>Driver: {trip.driver?.name || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Car className="h-4 w-4 text-gray-500" />
                    <span>Vehicle: {trip.vehicle?.licensePlate || 'Unassigned'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {trip.fare && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span>${trip.fare}</span>
                    </div>
                  )}
                  {trip.notes && (
                    <div className="text-sm text-gray-600">
                      Notes: {trip.notes}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {trip.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => setSelectedTrip(trip)}
                    >
                      Assign Driver
                    </Button>
                  )}
                  {trip.status === 'scheduled' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatusMutation.mutate({ id: trip._id, status: 'in-progress' })}
                    >
                      Start Trip
                    </Button>
                  )}
                  {trip.status === 'in-progress' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatusMutation.mutate({ id: trip._id, status: 'completed' })}
                    >
                      Complete Trip
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTrips.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No trips found</h3>
            <p className="text-gray-600">
              {statusFilter === 'all' ? 'No trips have been created yet.' : `No ${statusFilter} trips found.`}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Assignment Dialog */}
      {selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Assign Driver & Vehicle</CardTitle>
              <CardDescription>
                Trip: {selectedTrip.from} → {selectedTrip.to}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Driver</label>
                <Select onValueChange={(value) => setSelectedTrip({ ...selectedTrip, selectedDriver: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.filter(d => d.status === 'active').map((driver) => (
                      <SelectItem key={driver._id} value={driver._id}>
                        {driver.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Vehicle</label>
                <Select onValueChange={(value) => setSelectedTrip({ ...selectedTrip, selectedVehicle: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.filter(v => v.status === 'active').map((vehicle) => (
                      <SelectItem key={vehicle._id} value={vehicle._id}>
                        {vehicle.licensePlate} - {vehicle.make} {vehicle.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    assignDriverMutation.mutate({
                      tripId: selectedTrip._id,
                      driverId: selectedTrip.selectedDriver,
                      vehicleId: selectedTrip.selectedVehicle,
                    });
                  }}
                  disabled={!selectedTrip.selectedDriver || !selectedTrip.selectedVehicle}
                  className="flex-1"
                >
                  Assign
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedTrip(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}