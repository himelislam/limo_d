import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Car, User, Clock, MapPin, Users, DollarSign, AlertCircle } from 'lucide-react';
import { assignTrip, getAvailableResources } from '@/api/trips';

export default function TripAssignmentDialog({ trip, isOpen, onClose }) {
  const [formData, setFormData] = useState({
    driver: '',
    vehicle: '',
    fare: '',
    estimatedDuration: '',
    notes: ''
  });

  const queryClient = useQueryClient();

  const { data: resourcesRes, isLoading: resourcesLoading } = useQuery({
    queryKey: ['available-resources', trip?._id],
    queryFn: () => getAvailableResources(trip._id),
    enabled: !!trip && isOpen
  });

  const resources = resourcesRes?.data || {};
  const availableDrivers = resources.drivers || [];
  const availableVehicles = resources.vehicles || [];

  const assignMutation = useMutation({
    mutationFn: ({ tripId, data }) => assignTrip(tripId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['owner-trips']);
      queryClient.invalidateQueries(['pending-trips']);
      onClose();
      resetForm();
    },
  });

  const resetForm = () => {
    setFormData({
      driver: '',
      vehicle: trip?.vehicle?._id || '',
      fare: '',
      estimatedDuration: '',
      notes: ''
    });
  };

  useEffect(() => {
    if (trip && isOpen) {
      setFormData({
        driver: '',
        vehicle: trip.vehicle?._id || '',
        fare: '',
        estimatedDuration: '',
        notes: ''
      });
    }
  }, [trip, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.driver || !formData.vehicle || !formData.fare) {
      return;
    }

    const assignmentData = {
      driver: formData.driver,
      vehicle: formData.vehicle,
      fare: parseFloat(formData.fare),
      estimatedDuration: formData.estimatedDuration ? parseInt(formData.estimatedDuration) : undefined,
      notes: formData.notes
    };

    assignMutation.mutate({
      tripId: trip._id,
      data: assignmentData
    });
  };

  const selectedDriver = availableDrivers.find(d => d._id === formData.driver);
  const selectedVehicle = availableVehicles.find(v => v._id === formData.vehicle);

  if (!trip) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Trip</DialogTitle>
          <DialogDescription>
            Assign a driver and vehicle to this trip request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Trip Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Trip Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Route</Label>
                  <p className="text-sm">{trip.origin} → {trip.destination}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Passenger</Label>
                  <p className="text-sm">{trip.passenger?.name}</p>
                  <p className="text-xs text-gray-500">{trip.passenger?.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Scheduled Time</Label>
                  <p className="text-sm">{new Date(trip.scheduledTime).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Passengers</Label>
                  <p className="text-sm flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {trip.passengerCount}
                  </p>
                </div>
              </div>
              {trip.notes && (
                <div>
                  <Label className="text-sm font-medium">Passenger Notes</Label>
                  <p className="text-sm text-gray-600">{trip.notes}</p>
                </div>
              )}
              {trip.vehicle && (
                <div>
                  <Label className="text-sm font-medium">Pre-selected Vehicle</Label>
                  <p className="text-sm">{trip.vehicle.type} ({trip.vehicle.licensePlate})</p>
                </div>
              )}
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Driver Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Select Driver
                </CardTitle>
                <CardDescription>
                  Choose an available driver for this trip
                </CardDescription>
              </CardHeader>
              <CardContent>
                {resourcesLoading ? (
                  <div>Loading available drivers...</div>
                ) : availableDrivers.length === 0 ? (
                  <div className="flex items-center gap-2 text-amber-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>No drivers available for this time slot</span>
                  </div>
                ) : (
                  <div className="grid gap-3 max-h-40 overflow-y-auto">
                    {availableDrivers.map((driver) => (
                      <Card 
                        key={driver._id}
                        className={`cursor-pointer transition-colors ${
                          formData.driver === driver._id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setFormData({ ...formData, driver: driver._id })}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{driver.name}</h4>
                              <p className="text-sm text-gray-500">License: {driver.licenseNumber}</p>
                              <p className="text-sm text-gray-500">Experience: {driver.experience || 'N/A'} years</p>
                            </div>
                            <div className="text-right">
                              <Badge variant="secondary">{driver.status}</Badge>
                              <p className="text-sm text-gray-500">{driver.contactNumber}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vehicle Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Select Vehicle
                </CardTitle>
                <CardDescription>
                  Choose an available vehicle for this trip
                </CardDescription>
              </CardHeader>
              <CardContent>
                {resourcesLoading ? (
                  <div>Loading available vehicles...</div>
                ) : availableVehicles.length === 0 ? (
                  <div className="flex items-center gap-2 text-amber-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>No vehicles available for this time slot</span>
                  </div>
                ) : (
                  <div className="grid gap-3 max-h-40 overflow-y-auto">
                    {availableVehicles.map((vehicle) => (
                      <Card 
                        key={vehicle._id}
                        className={`cursor-pointer transition-colors ${
                          formData.vehicle === vehicle._id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'
                        } ${
                          vehicle.seatingCapacity < trip.passengerCount ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={() => {
                          if (vehicle.seatingCapacity >= trip.passengerCount) {
                            setFormData({ ...formData, vehicle: vehicle._id });
                          }
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{vehicle.make} {vehicle.model}</h4>
                              <p className="text-sm text-gray-500">Type: {vehicle.type}</p>
                              <p className="text-sm text-gray-500">License: {vehicle.licensePlate}</p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 mb-1">
                                <Users className="h-4 w-4" />
                                <span className={`text-sm ${
                                  vehicle.seatingCapacity < trip.passengerCount ? 'text-red-500' : ''
                                }`}>
                                  {vehicle.seatingCapacity} seats
                                </span>
                              </div>
                              <Badge variant="secondary">{vehicle.status}</Badge>
                              {vehicle.seatingCapacity < trip.passengerCount && (
                                <p className="text-xs text-red-500">Insufficient capacity</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Trip Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Trip Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fare">Fare Amount *</Label>
                    <Input
                      id="fare"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.fare}
                      onChange={(e) => setFormData({ ...formData, fare: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimatedDuration">Estimated Duration (minutes)</Label>
                    <Input
                      id="estimatedDuration"
                      type="number"
                      min="1"
                      value={formData.estimatedDuration}
                      onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                      placeholder="60"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Assignment Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any special instructions for the driver..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Assignment Summary */}
            {(selectedDriver || selectedVehicle) && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg">Assignment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedDriver && (
                    <div>
                      <Label className="text-sm font-medium">Assigned Driver</Label>
                      <p className="text-sm">{selectedDriver.name} - {selectedDriver.licenseNumber}</p>
                    </div>
                  )}
                  {selectedVehicle && (
                    <div>
                      <Label className="text-sm font-medium">Assigned Vehicle</Label>
                      <p className="text-sm">{selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.licensePlate})</p>
                    </div>
                  )}
                  {formData.fare && (
                    <div>
                      <Label className="text-sm font-medium">Fare</Label>
                      <p className="text-sm">${formData.fare}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={
                  !formData.driver || 
                  !formData.vehicle || 
                  !formData.fare || 
                  assignMutation.isLoading ||
                  resourcesLoading
                }
              >
                {assignMutation.isLoading ? 'Assigning...' : 'Assign Trip'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}