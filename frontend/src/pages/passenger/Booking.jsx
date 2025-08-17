import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Car, DollarSign, Star, Users } from 'lucide-react';
import { getBusinesses } from '@/api/business';
import { getVehicles } from '@/api/vehicles';
import { createTrip } from '@/api/trips';
import { useAuth } from '@/contexts/AuthContext';

export default function PassengerBooking() {
  const { user } = useAuth();
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [bookingData, setBookingData] = useState({
    from: '',
    to: '',
    scheduledTime: '',
    vehicleType: '',
    passengers: 1,
    notes: ''
  });
  const [step, setStep] = useState(1); // 1: Business Selection, 2: Trip Details, 3: Confirmation
  const queryClient = useQueryClient();

  const { data: businessesData, isLoading: businessesLoading } = useQuery({
    queryKey: ['active-businesses'],
    queryFn: async () => {
      const result = await getBusinesses();
      return {
        ...result,
        data: result.data.filter(business => business.status === 'active')
      };
    },
  });

  const { data: vehiclesData, isLoading: vehiclesLoading } = useQuery({
    queryKey: ['vehicles', selectedBusiness],
    queryFn: () => getVehicles({ businessId: selectedBusiness }),
    enabled: !!selectedBusiness,
  });

  const createTripMutation = useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      queryClient.invalidateQueries(['passenger-trips']);
      setStep(3);
    },
  });

  const businesses = businessesData?.data || [];
  const vehicles = vehiclesData?.data || [];

  const availableVehicleTypes = [...new Set(vehicles.map(v => v.type))];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBusinessSelect = (businessId) => {
    setSelectedBusiness(businessId);
    setStep(2);
  };

  const handleBookTrip = () => {
    const selectedBusinessData = businesses.find(b => b._id === selectedBusiness);
    
    createTripMutation.mutate({
      ...bookingData,
      passenger: user.id,
      business: selectedBusiness,
      status: 'pending',
      estimatedFare: calculateEstimatedFare()
    });
  };

  const calculateEstimatedFare = () => {
    // Simple fare calculation - in real app, this would be more sophisticated
    const baseRate = 50;
    const perKmRate = 12;
    const estimatedDistance = 10; // This would come from a mapping service
    return baseRate + (estimatedDistance * perKmRate);
  };

  const resetBooking = () => {
    setStep(1);
    setSelectedBusiness('');
    setBookingData({
      from: '',
      to: '',
      scheduledTime: '',
      vehicleType: '',
      passengers: 1,
      notes: ''
    });
  };

  if (businessesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Book a Trip</h1>
        <p className="text-gray-600">Choose a service provider and book your ride</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center space-x-4 mb-8">
        <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            1
          </div>
          <span className="ml-2 font-medium">Select Service</span>
        </div>
        <div className={`w-8 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
        <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            2
          </div>
          <span className="ml-2 font-medium">Trip Details</span>
        </div>
        <div className={`w-8 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
        <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            3
          </div>
          <span className="ml-2 font-medium">Confirmation</span>
        </div>
      </div>

      {/* Step 1: Business Selection */}
      {step === 1 && (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Service Providers</CardTitle>
              <CardDescription>
                Choose from our verified transport service providers
              </CardDescription>
            </CardHeader>
          </Card>

          {businesses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Car className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No services available</h3>
                <p className="text-gray-500">
                  No transport services are currently available in your area.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {businesses.map((business) => (
                <Card key={business._id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Car className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{business.name}</h3>
                          <p className="text-sm text-gray-600 capitalize">{business.businessType}</p>
                          <div className="flex items-center mt-2 space-x-4">
                            <div className="flex items-center text-sm text-gray-500">
                              <Star className="h-4 w-4 mr-1 text-yellow-400" />
                              4.5 (120 reviews)
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Car className="h-4 w-4 mr-1" />
                              {vehicles.filter(v => v.business === business._id).length} vehicles
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                        <p className="text-sm text-gray-500 mt-2">Starting from ₹50</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button 
                        onClick={() => handleBusinessSelect(business._id)}
                        className="w-full"
                      >
                        Select Service
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Trip Details */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Trip Details</CardTitle>
            <CardDescription>
              Provide your trip information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="from">Pickup Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="from"
                      name="from"
                      type="text"
                      required
                      value={bookingData.from}
                      onChange={handleInputChange}
                      placeholder="Enter pickup location"
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="to">Drop-off Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="to"
                      name="to"
                      type="text"
                      required
                      value={bookingData.to}
                      onChange={handleInputChange}
                      placeholder="Enter destination"
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="scheduledTime">Pickup Time *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="scheduledTime"
                      name="scheduledTime"
                      type="datetime-local"
                      required
                      value={bookingData.scheduledTime}
                      onChange={handleInputChange}
                      className="pl-10"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="passengers">Number of Passengers</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Select 
                      value={bookingData.passengers.toString()} 
                      onValueChange={(value) => setBookingData(prev => ({...prev, passengers: parseInt(value)}))}
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select passengers" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8].map(num => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'Passenger' : 'Passengers'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {availableVehicleTypes.length > 0 && (
                  <div className="md:col-span-2">
                    <Label htmlFor="vehicleType">Preferred Vehicle Type</Label>
                    <Select 
                      value={bookingData.vehicleType} 
                      onValueChange={(value) => setBookingData(prev => ({...prev, vehicleType: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle type (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any Available</SelectItem>
                        {availableVehicleTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="md:col-span-2">
                  <Label htmlFor="notes">Special Instructions (Optional)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={bookingData.notes}
                    onChange={handleInputChange}
                    placeholder="Any special requirements or instructions..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Fare Estimate */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-900">Estimated Fare</span>
                  </div>
                  <span className="text-lg font-bold text-blue-900">₹{calculateEstimatedFare()}</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  Final fare may vary based on actual distance and time
                </p>
              </div>

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleBookTrip}
                  disabled={!bookingData.from || !bookingData.to || !bookingData.scheduledTime || createTripMutation.isLoading}
                  className="flex-1"
                >
                  {createTripMutation.isLoading ? 'Booking...' : 'Book Trip'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <Car className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Trip Booked Successfully!</h3>
            <p className="text-gray-500 mb-6">
              Your trip has been booked and is pending confirmation from the service provider.
              You'll receive updates via email and SMS.
            </p>
            <div className="space-y-2 mb-6">
              <Button onClick={() => window.location.href = '/passenger/trips'} className="w-full">
                View My Trips
              </Button>
              <Button variant="outline" onClick={resetBooking} className="w-full">
                Book Another Trip
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
