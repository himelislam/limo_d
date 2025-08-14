import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '@/api/config';

export default function BookingConfirmation() {
  const { token } = useParams();
  const location = useLocation();
  
  // Extract action from pathname
  const action = location.pathname.includes('/confirm/') ? 'confirm' : 'decline';
  
  const [status, setStatus] = useState('loading');
  const [booking, setBooking] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    handleBookingAction();
  }, [token, action]);

  const handleBookingAction = async () => {
    try {
      const endpoint = action === 'confirm' ? 'confirm' : 'decline';
      const response = await api.post(`/bookings/${endpoint}/${token}`);
      
      setStatus('success');
      setBooking(response.data.data);
      setMessage(response.data.message);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.error || 'Something went wrong');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="pt-6 text-center">
            {status === 'success' ? (
              <>
                {action === 'confirm' ? (
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                ) : (
                  <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                )}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {action === 'confirm' ? 'Booking Confirmed!' : 'Booking Declined'}
                </h2>
                <p className="text-gray-600 mb-4">{message}</p>
                
                {booking && action === 'confirm' && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
                    <h3 className="font-medium mb-2">Trip Details:</h3>
                    <p className="text-sm text-gray-600">
                      <strong>From:</strong> {booking.origin}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>To:</strong> {booking.destination}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Date:</strong> {new Date(booking.scheduledTime).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Vehicle:</strong> {booking.vehicle?.make} {booking.vehicle?.model}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Fare:</strong> ${booking.fare}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Booking ID:</strong> {booking._id}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
                <p className="text-gray-600 mb-4">{message}</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
