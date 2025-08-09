import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Phone, Mail, Car, CheckCircle, XCircle } from 'lucide-react';
import { getDrivers, createDriver, updateDriverStatus } from '@/api/drivers';

export default function BusinessDrivers() {
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
  const [newDriver, setNewDriver] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    licenseNumber: '',
    licenseExpiry: '',
  });

  const queryClient = useQueryClient();

  const { data: driversRes = [], isLoading } = useQuery({
    queryKey: ['business-drivers'],
    queryFn: getDrivers,
  });

  const drivers = driversRes?.data || [];

  const addDriverMutation = useMutation({
    mutationFn: createDriver,
    onSuccess: () => {
      queryClient.invalidateQueries(['business-drivers']);
      setIsAddDriverOpen(false);
      setNewDriver({ name: '', email: '', phone: '', lice: '' });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => updateDriverStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['business-drivers']);
    },
  });

  const handleAddDriver = (e) => {
    e.preventDefault();
    addDriverMutation.mutate(newDriver);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Driver Management</h1>
          <p className="text-gray-600">Manage your business drivers</p>
        </div>
        <Dialog open={isAddDriverOpen} onOpenChange={setIsAddDriverOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Driver
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Driver</DialogTitle>
              <DialogDescription>
                Add a new driver to your fleet
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddDriver}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newDriver.name}
                    onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newDriver.email}
                    onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newDriver.password}
                    onChange={(e) => setNewDriver({ ...newDriver, password: e.target.value })}
                    required
                    minLength="6"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newDriver.phone}
                    onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input
                    id="licenseNumber"
                    value={newDriver.licenseNumber}
                    onChange={(e) => setNewDriver({ ...newDriver, licenseNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="licenseExpiry">License Expiry</Label>
                  <Input
                    id="licenseExpiry"
                    type="date"
                    value={newDriver.licenseExpiry}
                    onChange={(e) => setNewDriver({ ...newDriver, licenseExpiry: e.target.value })}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={addDriverMutation.isPending}>
                  {addDriverMutation.isPending ? 'Adding...' : 'Add Driver'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {drivers.map((driver) => (
          <Card key={driver._id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {driver.name}
                </span>
                <Badge variant={driver.status === 'active' ? 'default' : 'secondary'}>
                  {driver.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{driver.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{driver.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Car className="h-4 w-4 text-gray-500" />
                  <span>License: {driver.licenseNumber}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Expires: {new Date(driver.licenseExpiry).toLocaleDateString()}
                </div>
              </div>

              <div className="flex gap-2">
                {driver.status === 'active' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStatusMutation.mutate({ id: driver._id, status: 'inactive' })}
                    disabled={updateStatusMutation.isPending}
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateStatusMutation.mutate({ id: driver._id, status: 'active' })}
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

      {drivers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No drivers found</h3>
            <p className="text-gray-600 mb-4">Add your first driver to get started</p>
            <Button onClick={() => setIsAddDriverOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Driver
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
