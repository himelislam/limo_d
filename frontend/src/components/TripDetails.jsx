import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, User, Car, Phone } from 'lucide-react';
import { getTripById, updateTripStatus } from '@/api/trips';

export default function TripDetails({ tripId, userRole, onClose }) {
  const queryClient = useQueryClient();
  
  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => getTripById(tripId),
    enabled: !!tripId
  });

  const statusMutation = useMutation({
    mutationFn: ({ status }) => updateTripStatus(tripId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['trip', tripId]);
      queryClient.invalidateQueries(['trips']);
    }
  });

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      scheduled: 'bg-blue-100 text-blue-800',
      'on-the-way': 'bg-orange-100 text-orange-800',
      started: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) return <div>Loading trip details...</div>;
  if (!trip) return <div>Trip not found</div>;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>Trip Details</CardTitle>
          <Badge className={getStatusColor(trip.status)}>
            {trip.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Trip Route */}
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-green-600" />
          <span className="font-medium">{trip.origin}</span>
          <span>→</span>
          <MapPin className="h-4 w-4 text-red-600" />
          <span className="font-medium">{trip.destination}</span>
        </div>

        {/* Schedule */}
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4" />
          <span>{new Date(trip.scheduledTime).toLocaleString()}</span>
        </div>

        {/* Passenger Info */}
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4" />
          <span>{trip.passenger?.name}</span>
          <Phone className="h-4 w-4 ml-4" />
          <span>{trip.passenger?.phone}</span>
        </div>

        {/* Driver & Vehicle Info */}
        {trip.driver && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium">Driver</h4>
              <p>{trip.driver.name}</p>
              <p className="text-sm text-gray-600">{trip.driver.phone}</p>
            </div>
            {trip.vehicle && (
              <div>
                <h4 className="font-medium">Vehicle</h4>
                <p>{trip.vehicle.make} {trip.vehicle.model}</p>
                <p className="text-sm text-gray-600">{trip.vehicle.licensePlate}</p>
              </div>
            )}
          </div>
        )}

        {/* Driver Actions */}
        {userRole === 'driver' && trip.status !== 'completed' && trip.status !== 'cancelled' && (
          <div className="flex space-x-2">
            {trip.status === 'scheduled' && (
              <Button 
                onClick={() => statusMutation.mutate({ status: 'on-the-way' })}
                disabled={statusMutation.isLoading}
              >
                Start Journey
              </Button>
            )}
            {trip.status === 'on-the-way' && (
              <Button 
                onClick={() => statusMutation.mutate({ status: 'started' })}
                disabled={statusMutation.isLoading}
              >
                Pick Up Passenger
              </Button>
            )}
            {trip.status === 'started' && (
              <Button 
                onClick={() => statusMutation.mutate({ status: 'completed' })}
                disabled={statusMutation.isLoading}
              >
                Complete Trip
              </Button>
            )}
          </div>
        )}

        {/* Notes */}
        {trip.notes && (
          <div>
            <h4 className="font-medium">Notes</h4>
            <p className="text-sm text-gray-600">{trip.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}