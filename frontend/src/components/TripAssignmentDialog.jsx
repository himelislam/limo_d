import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MapPin, User, Car, Clock } from 'lucide-react';
import { assignTripDriver } from '@/api/trips';

export default function TripAssignmentDialog({ trip, drivers, vehicles, onClose }) {
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');

  const queryClient = useQueryClient();

  const assignMutation = useMutation({
    mutationFn: ({ tripId, driverId, vehicleId }) => assignTripDriver(tripId, driverId, vehicleId),
    onSuccess: () => {
      queryClient.invalidateQueries(['business-trips']);
      queryClient.invalidateQueries(['pending-trips']);
      onClose();
    },
  });

  const handleAssign = () => {
    if (selectedDriver && selectedVehicle) {
      assignMutation.mutate({
        tripId: trip._id,
        driverId: selectedDriver,
        vehicleId: selectedVehicle,
      });
    }
  };

  const availableDrivers = drivers.filter(d => d.status === 'active' || d.status === 'available');
  const availableVehicles = vehicles.filter(v => v.status === 'active');

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Driver & Vehicle</DialogTitle>
          <DialogDescription>
            Assign a driver and vehicle to this trip
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Trip Details */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">{trip.from} → {trip.to}</span>
            </div>
            <div className="text-sm text-gray-600">
              <div>Passenger: {trip.passenger?.name || 'Unknown'}</div>
              <div>Scheduled: {new Date(trip.scheduledTime).toLocaleString()}</div>
              {trip.fare && <div>Fare: ${trip.fare}</div>}
            </div>
          </div>

          {/* Driver Selection */}
          <div>
            <Label>Select Driver</Label>
            <Select onValueChange={setSelectedDriver}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a driver" />
              </SelectTrigger>
              <SelectContent>
                {availableDrivers.map((driver) => (
                  <SelectItem key={driver._id} value={driver._id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{driver.name}</span>
                      <Badge variant="outline" className="ml-auto">
                        {driver.status}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableDrivers.length === 0 && (
              <p className="text-sm text-red-600 mt-1">No available drivers</p>
            )}
          </div>

          {/* Vehicle Selection */}
          <div>
            <Label>Select Vehicle</Label>
            <Select onValueChange={setSelectedVehicle}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a vehicle" />
              </SelectTrigger>
              <SelectContent>
                {availableVehicles.map((vehicle) => (
                  <SelectItem key={vehicle._id} value={vehicle._id}>
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      <span>{vehicle.licensePlate} - {vehicle.make} {vehicle.model}</span>
                      <Badge variant="outline" className="ml-auto">
                        {vehicle.status}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableVehicles.length === 0 && (
              <p className="text-sm text-red-600 mt-1">No available vehicles</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssign}
            disabled={!selectedDriver || !selectedVehicle || assignMutation.isPending}
          >
            {assignMutation.isPending ? 'Assigning...' : 'Assign Trip'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
