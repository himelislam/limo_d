
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, Plus, CheckCircle, XCircle, Users } from 'lucide-react';
import { getVehicles, createVehicle, updateVehicleStatus } from '@/api/vehicles';

export default function BusinessVehicles() {
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    make: '',
    model: '',
    year: '',
    licensePlate: '',
    type: '',
    seatingCapacity: '',
    fuelType: 'gasoline',
    mileage: 0,
    lastServiceDate: ''
  });

  const queryClient = useQueryClient();

  const { data: vehiclesRes = [], isLoading } = useQuery({
    queryKey: ['business-vehicles'],
    queryFn: getVehicles,
  });

  const vehicles = vehiclesRes?.data || [];

  const addVehicleMutation = useMutation({
    mutationFn: createVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries(['business-vehicles']);
      setIsAddVehicleOpen(false);
      setNewVehicle({ 
        make: '', 
        model: '', 
        year: '', 
        licensePlate: '', 
        type: '', 
        seatingCapacity: '', 
        fuelType: 'gasoline',
        mileage: 0,
        lastServiceDate: ''
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => updateVehicleStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['business-vehicles']);
    },
  });

  const handleAddVehicle = (e) => {
    e.preventDefault();
    addVehicleMutation.mutate({
      ...newVehicle,
      year: parseInt(newVehicle.year),
      capacity: parseInt(newVehicle.capacity),
    });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicle Management</h1>
          <p className="text-gray-600">Manage your business fleet</p>
        </div>
        <Dialog open={isAddVehicleOpen} onOpenChange={setIsAddVehicleOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Vehicle</DialogTitle>
              <DialogDescription>
                Add a new vehicle to your fleet
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddVehicle}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="make">Make</Label>
                    <Input
                      id="make"
                      value={newVehicle.make}
                      onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={newVehicle.model}
                      onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={newVehicle.year}
                      onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="licensePlate">License Plate</Label>
                    <Input
                      id="licensePlate"
                      value={newVehicle.licensePlate}
                      onChange={(e) => setNewVehicle({ ...newVehicle, licensePlate: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type">Vehicle Type</Label>
                    <Select value={newVehicle.type} onValueChange={(value) => setNewVehicle({ ...newVehicle, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedan">Sedan</SelectItem>
                        <SelectItem value="suv">SUV</SelectItem>
                        <SelectItem value="van">Van</SelectItem>
                        <SelectItem value="truck">Truck</SelectItem>
                        <SelectItem value="bus">Bus</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="seatingCapacity">Seating Capacity</Label>
                    <Input
                      id="seatingCapacity"
                      type="number"
                      min="1"
                      value={newVehicle.seatingCapacity}
                      onChange={(e) => setNewVehicle({ ...newVehicle, seatingCapacity: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="fuelType">Fuel Type</Label>
                    <Select value={newVehicle.fuelType} onValueChange={(value) => setNewVehicle({ ...newVehicle, fuelType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gasoline">Gasoline</SelectItem>
                        <SelectItem value="diesel">Diesel</SelectItem>
                        <SelectItem value="electric">Electric</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mileage">Current Mileage</Label>
                  <Input
                    id="mileage"
                    type="number"
                    min="0"
                    value={newVehicle.mileage}
                    onChange={(e) => setNewVehicle({ ...newVehicle, mileage: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastServiceDate">Last Service Date (Optional)</Label>
                  <Input
                    id="lastServiceDate"
                    type="date"
                    value={newVehicle.lastServiceDate}
                    onChange={(e) => setNewVehicle({ ...newVehicle, lastServiceDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={newVehicle.color}
                    onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={addVehicleMutation.isPending}>
                  {addVehicleMutation.isPending ? 'Adding...' : 'Add Vehicle'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((vehicle) => (
          <Card key={vehicle._id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  {vehicle.licensePlate}
                </span>
                <Badge variant={vehicle.status === 'active' ? 'default' : 'secondary'}>
                  {vehicle.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-lg font-semibold">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>Capacity: {vehicle.capacity} passengers</span>
                </div>
                <div className="text-sm text-gray-600">
                  Type: {vehicle.type} • Color: {vehicle.color}
                </div>
              </div>

              <div className="flex gap-2">
                {vehicle.status === 'active' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStatusMutation.mutate({ id: vehicle._id, status: 'inactive' })}
                    disabled={updateStatusMutation.isPending}
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStatusMutation.mutate({ id: vehicle._id, status: 'active' })}
                    disabled={updateStatusMutation.isPending}
                  >
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Activate
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {vehicles.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
            <p className="text-gray-600 mb-4">Add your first vehicle to get started</p>
            <Button onClick={() => setIsAddVehicleOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Vehicle
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
