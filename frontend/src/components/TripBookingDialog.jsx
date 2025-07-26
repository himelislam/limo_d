import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Calendar, Users, Car } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createTrip } from '@/api/trips';
import { getVehicles } from '@/api/vehicles';

export default function TripBookingDialog({ isOpen, onClose }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    scheduledTime: '',
    passengerCount: 1,
    vehicle: '',
    notes: '',
    passenger: user._id
  });

  const queryClient = useQueryClient();

  const { data: vehicleRes = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: getVehicles,
    enabled: isOpen
  });
  const vehicles = vehicleRes?.data ?? [];

  const createMutation = useMutation({
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

    if (formData.vehicle && formData.vehicle !== 'any') {
      tripData.vehicle = formData.vehicle;
    }

    createMutation.mutate(tripData);
  };

  const minDateTime = new Date();
  minDateTime.setHours(minDateTime.getHours() + 1);
  const minDateTimeString = minDateTime.toISOString().slice(0, 16);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book a Trip</DialogTitle>
          <DialogDescription>
            Fill in the details for your trip request
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin">From *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="origin"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  placeholder="Origin"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">To *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  placeholder="Destination"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduledTime">Scheduled Time *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="scheduledTime"
                type="datetime-local"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                min={minDateTimeString}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="passengerCount">Passengers *</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="passengerCount"
                  type="number"
                  min="1"
                  max="8"
                  value={formData.passengerCount}
                  onChange={(e) => setFormData({ ...formData, passengerCount: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle">Preferred Vehicle</Label>
              <Select
                value={formData.vehicle}
                onValueChange={(value) => setFormData({ ...formData, vehicle: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any vehicle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any available vehicle</SelectItem>
                  {vehicles
                    .filter(v => v.status === 'active' && v.seatingCapacity >= formData.passengerCount)
                    .map((vehicle) => (
                      <SelectItem key={vehicle._id} value={vehicle._id}>
                        {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Special Instructions</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any special requirements or notes..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isLoading}>
              {createMutation.isLoading ? 'Booking...' : 'Book Trip'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
