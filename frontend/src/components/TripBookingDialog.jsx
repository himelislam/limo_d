import { use, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Car, Users, Calendar, MapPin } from 'lucide-react';
import { createTrip } from '@/api/trips';
import { getVehicles } from '@/api/vehicles';
import { useAuth } from '@/contexts/AuthContext';

export default function TripBookingDialog({ isOpen, onClose }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    scheduledTime: '',
    passengerCount: 1,
    vehicle: '',
    notes: '',
    passenger: user._id
  });

  console.log(user);

  const { data: vehiclesRes = [] } = useQuery({
    queryKey: ['available-vehicles'],
    queryFn: getVehicles,
    enabled: isOpen
  });

  const vehicles = vehiclesRes?.data?.filter(v => v.status === 'active') || [];

  const createTripMutation = useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      queryClient.invalidateQueries(['passenger-trips']);
      onClose();
      resetForm();
    },
  });

  const resetForm = () => {
    setFormData({
      origin: '',
      destination: '',
      scheduledTime: '',
      passengerCount: 1,
      vehicle: '',
      notes: '',
      passenger: user._id
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const tripData = {
      passenger: user.id,
      origin: formData.origin,
      destination: formData.destination,
      scheduledTime: formData.scheduledTime,
      passengerCount: parseInt(formData.passengerCount),
      notes: formData.notes,
      passenger: user._id
    };

    if (formData.vehicle) {
      tripData.vehicle = formData.vehicle;
    }

    createTripMutation.mutate(tripData);
  };

  const selectedVehicle = vehicles.find(v => v._id === formData.vehicle);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book a Trip</DialogTitle>
          <DialogDescription>
            Fill in the details for your trip booking. You can select a vehicle or let the owner assign one.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin">From</Label>
              <Input
                id="origin"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                placeholder="Pickup location"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">To</Label>
              <Input
                id="destination"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                placeholder="Drop-off location"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledTime">Scheduled Time</Label>
              <Input
                id="scheduledTime"
                type="datetime-local"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                min={new Date().toISOString().slice(0, 16)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passengerCount">Passengers</Label>
              <Select
                value={formData.passengerCount.toString()}
                onValueChange={(value) => setFormData({ ...formData, passengerCount: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Vehicle Selection (Optional)</Label>
            <p className="text-sm text-gray-500 mb-3">
              You can select a preferred vehicle or let the owner assign one for you.
            </p>
            
            <div className="grid gap-3 max-h-60 overflow-y-auto">
              <Card 
                className={`cursor-pointer transition-colors ${!formData.vehicle ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'}`}
                onClick={() => setFormData({ ...formData, vehicle: '' })}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Let owner assign</h4>
                      <p className="text-sm text-gray-500">Owner will select the best available vehicle</p>
                    </div>
                    <Car className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              {vehicles.map((vehicle) => (
                <Card 
                  key={vehicle._id}
                  className={`cursor-pointer transition-colors ${
                    formData.vehicle === vehicle._id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setFormData({ ...formData, vehicle: vehicle._id })}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{vehicle.type}</h4>
                          <Badge variant="outline">{vehicle.licensePlate}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{vehicle.seatingCapacity} seats</span>
                          </div>
                          <Badge variant="secondary">{vehicle.status}</Badge>
                        </div>
                      </div>
                      <Car className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any special requirements or notes..."
              rows={3}
            />
          </div>

          {selectedVehicle && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Selected Vehicle</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedVehicle.type}</p>
                    <p className="text-sm text-gray-600">{selectedVehicle.licensePlate}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p>{selectedVehicle.seatingCapacity} seats</p>
                    <Badge variant="secondary">{selectedVehicle.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTripMutation.isLoading}>
              {createTripMutation.isLoading ? 'Booking...' : 'Book Trip'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}