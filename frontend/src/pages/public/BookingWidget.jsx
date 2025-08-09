import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Clock, 
  Car, 
  DollarSign, 
  Phone, 
  Mail, 
  User,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { getBusinessByWidgetId } from '@/api/business';
import { submitWidgetBooking } from '@/api/bookings';

export default function BookingWidget() {
  const { widgetId: paramWidgetId } = useParams();
  
  // Fallback: extract widgetId from URL manually if useParams fails
  const widgetId = paramWidgetId || window.location.pathname.split('/widget/')[1];
  
  // Debug logging
  console.log('Current URL:', window.location.href);
  console.log('Widget ID from params:', paramWidgetId);
  console.log('Widget ID final:', widgetId);
  
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    origin: '',
    destination: '',
    pickupDate: '',
    pickupTime: '',
    vehicleType: '',
    passengers: 1,
    notes: '',
    priceType: 'request'
  });
  const [submissionStatus, setSubmissionStatus] = useState(null);

  const { data: businessRes, isLoading } = useQuery({
    queryKey: ['widget-business', widgetId],
    queryFn: () => getBusinessByWidgetId(widgetId),
    enabled: !!widgetId,
  });

  const business = businessRes?.data || {
    _id: widgetId,
    name: 'Transport Service',
    logo: null,
    settings: {
      bookingWidget: {
        customization: {
          primaryColor: '#3B82F6',
          welcomeMessage: 'Book your ride with us! Safe, reliable, and affordable transportation.'
        }
      }
    },
    vehicleTypes: [
      { id: 'sedan', name: 'Sedan', capacity: 4, basePrice: 50 },
      { id: 'suv', name: 'SUV', capacity: 6, basePrice: 80 },
      { id: 'luxury', name: 'Luxury Car', capacity: 4, basePrice: 120 },
      { id: 'van', name: 'Van', capacity: 8, basePrice: 100 }
    ]
  };

  const submitBookingMutation = useMutation({
    mutationFn: async (data) => {
      if (!widgetId) {
        throw new Error('Widget ID is missing');
      }
      
      return await submitWidgetBooking(widgetId, data);
    },
    onSuccess: () => {
      setSubmissionStatus('success');
      setStep(3);
    },
    onError: () => {
      setSubmissionStatus('error');
      setStep(3);
    }
  });

  const handleInputChange = (field, value) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitBooking = async () => {
    if (!widgetId) {
      console.error('Cannot submit booking: Widget ID is missing');
      return;
    }
    
    // Combine pickupDate and pickupTime into scheduledTime
    const scheduledTime = new Date(`${bookingData.pickupDate}T${bookingData.pickupTime}`);
    
    submitBookingMutation.mutate({
      customerName: bookingData.customerName,
      customerEmail: bookingData.customerEmail,
      customerPhone: bookingData.customerPhone,
      origin: bookingData.origin,
      destination: bookingData.destination,
      scheduledTime: scheduledTime.toISOString(),
      passengerCount: bookingData.passengers,
      vehicleType: bookingData.vehicleType,
      notes: bookingData.notes,
      businessId: business._id,
      widgetId
    });
  };

  const selectedVehicle = business.vehicleTypes?.find(v => v.id === bookingData.vehicleType);
  const primaryColor = business.settings?.bookingWidget?.customization?.primaryColor || '#3B82F6';
  const welcomeMessage = business.settings?.bookingWidget?.customization?.welcomeMessage || 'Book your ride with us!';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="pt-6 text-center">
              {submissionStatus === 'success' ? (
                <>
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Submitted!</h2>
                  <p className="text-gray-600 mb-4">
                    Thank you for your booking request. We'll contact you shortly to confirm the details and pricing.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600">
                      <strong>Booking ID:</strong> BK{Date.now()}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Customer:</strong> {bookingData.customerName}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Route:</strong> {bookingData.origin} → {bookingData.destination}
                    </p>
                  </div>
                  <Button 
                    onClick={() => {
                      setStep(1);
                      setBookingData({
                        customerName: '',
                        customerEmail: '',
                        customerPhone: '',
                        origin: '',
                        destination: '',
                        pickupDate: '',
                        pickupTime: '',
                        vehicleType: '',
                        passengers: 1,
                        notes: '',
                        priceType: 'request'
                      });
                      setSubmissionStatus(null);
                    }}
                    className="w-full"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Book Another Ride
                  </Button>
                </>
              ) : (
                <>
                  <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Failed</h2>
                  <p className="text-gray-600 mb-4">
                    Sorry, there was an error submitting your booking. Please try again.
                  </p>
                  <Button 
                    onClick={() => setStep(2)}
                    className="w-full"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Try Again
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Business Header */}
        <div className="text-center mb-6">
          {business.logo && (
            <img src={business.logo} alt={business.name} className="h-12 mx-auto mb-4" />
          )}
          <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
          <p className="text-gray-600 mt-2">{welcomeMessage}</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
          </div>
        </div>

        {/* Step 1: Trip Details */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Trip Details
              </CardTitle>
              <CardDescription>Where would you like to go?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="origin">Pickup Location *</Label>
                <Input
                  id="origin"
                  value={bookingData.origin}
                  onChange={(e) => handleInputChange('origin', e.target.value)}
                  placeholder="Enter pickup address"
                  required
                />
              </div>

              <div>
                <Label htmlFor="destination">Drop-off Location *</Label>
                <Input
                  id="destination"
                  value={bookingData.destination}
                  onChange={(e) => handleInputChange('destination', e.target.value)}
                  placeholder="Enter destination address"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pickupDate">Date *</Label>
                  <Input
                    id="pickupDate"
                    type="date"
                    value={bookingData.pickupDate}
                    onChange={(e) => handleInputChange('pickupDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pickupTime">Time *</Label>
                  <Input
                    id="pickupTime"
                    type="time"
                    value={bookingData.pickupTime}
                    onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="vehicleType">Vehicle Type</Label>
                <Select onValueChange={(value) => handleInputChange('vehicleType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    {business.vehicleTypes?.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.name} - {vehicle.capacity} seats (from ${vehicle.basePrice})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="passengers">Number of Passengers</Label>
                <Select onValueChange={(value) => handleInputChange('passengers', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select passengers" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} passenger{num > 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Special Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={bookingData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any special requirements or notes"
                  rows={3}
                />
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!bookingData.origin || !bookingData.destination || !bookingData.pickupDate || !bookingData.pickupTime}
                className="w-full"
                style={{ backgroundColor: primaryColor }}
              >
                Continue to Contact Details
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Contact Details & Confirmation */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Contact Details
              </CardTitle>
              <CardDescription>How can we reach you?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customerName">Full Name *</Label>
                <Input
                  id="customerName"
                  value={bookingData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="customerEmail">Email Address *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={bookingData.customerEmail}
                  onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="customerPhone">Phone Number *</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={bookingData.customerPhone}
                  onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                  placeholder="+1234567890"
                  required
                />
              </div>

              {/* Trip Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Trip Summary</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>From:</strong> {bookingData.origin}</p>
                  <p><strong>To:</strong> {bookingData.destination}</p>
                  <p><strong>Date & Time:</strong> {bookingData.pickupDate} at {bookingData.pickupTime}</p>
                  <p><strong>Passengers:</strong> {bookingData.passengers}</p>
                  {selectedVehicle && (
                    <p><strong>Vehicle:</strong> {selectedVehicle.name} (from ${selectedVehicle.basePrice})</p>
                  )}
                </div>
              </div>

              {/* Pricing Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <p className="font-medium text-blue-900">Pricing</p>
                    <p className="text-sm text-blue-700">
                      We'll contact you with the exact fare based on your trip details.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmitBooking}
                  disabled={!bookingData.customerName || !bookingData.customerEmail || !bookingData.customerPhone || submitBookingMutation.isPending}
                  className="flex-1"
                  style={{ backgroundColor: primaryColor }}
                >
                  {submitBookingMutation.isPending ? 'Submitting...' : 'Submit Booking'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
