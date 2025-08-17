import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { getVehicles } from '@/api/vehicles';
import api from '@/api/config';

export default function QuoteDialog({ booking, isOpen, onClose }) {
  const [formData, setFormData] = useState({
    vehicleId: '',
    proposedFare: '',
    notes: ''
  });

  const queryClient = useQueryClient();

  const { data: vehiclesRes } = useQuery({
    queryKey: ['business-vehicles'],
    queryFn: getVehicles,
    enabled: isOpen
  });
  const vehicles = vehiclesRes?.data || [];

  // Add debug logging
  console.log('All vehicles:', vehicles);
  console.log('Booking passenger count:', booking?.passengerCount);
  console.log('Filtered vehicles:', vehicles.filter(v => v.status === 'active' && v?.seatingCapacity >= booking?.passengerCount));

  const sendQuoteMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post(`/bookings/${booking._id}/quote`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['business-bookings']);
      queryClient.invalidateQueries(['pending-trips']);
      onClose();
      setFormData({ vehicleId: '', proposedFare: '', notes: '' });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    sendQuoteMutation.mutate(formData);
  };

  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send Quote to Passenger</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Booking Details */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="font-medium mb-2">Booking Details</h4>
            <div className="text-sm space-y-1">
              <p><strong>Customer:</strong> {booking.customerInfo?.name}</p>
              <p><strong>Route:</strong> {booking.origin} → {booking.destination}</p>
              <p><strong>Date:</strong> {new Date(booking.scheduledTime).toLocaleString()}</p>
              <p><strong>Passengers:</strong> {booking.passengerCount}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="vehicleId">Assign Vehicle *</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, vehicleId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles
                    .filter(v => {
                      const isActive = v.status === 'active' || v.status === 'available';
                      const hasCapacity = parseInt(v.seatingCapacity) >= parseInt(booking.passengerCount);
                      return isActive && hasCapacity;
                    })
                    .map((vehicle) => (
                      <SelectItem key={vehicle._id} value={vehicle._id}>
                        {vehicle.make} {vehicle.model} - {vehicle.type} ({vehicle.seatingCapacity} seats)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {vehicles
                .filter(v => {
                  const isActive = v.status === 'active' || v.status === 'available';
                  const hasCapacity = parseInt(v.seatingCapacity) >= parseInt(booking?.passengerCount);
                  return isActive && hasCapacity;
                })
                .length === 0 && (
                  <p className="text-sm text-red-600 mt-1">
                    No vehicles available for {booking?.passengerCount} passengers. 
                    {vehicles.length > 0 && ` Largest vehicle capacity: ${Math.max(...vehicles.map(v => v.seatingCapacity))} seats.`}
                  </p>
                )}
            </div>

            <div>
              <Label htmlFor="proposedFare">Proposed Fare ($) *</Label>
              <Input
                id="proposedFare"
                type="number"
                step="0.01"
                value={formData.proposedFare}
                onChange={(e) => setFormData(prev => ({ ...prev, proposedFare: e.target.value }))}
                placeholder="Enter fare amount"
                required
              />
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional information for the customer"
                rows={3}
              />
            </div>

            <div className="flex space-x-3">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!formData.vehicleId || !formData.proposedFare || sendQuoteMutation.isPending}
                className="flex-1"
              >
                {sendQuoteMutation.isPending ? 'Sending...' : 'Send Quote'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
