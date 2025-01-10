import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { BookingInterface } from '@/hooks';
import { BACKEND_URL } from '@/config';
import { Appbar } from '@/components/Appbar';
import { toast, Toaster } from 'react-hot-toast';
import { Spinner } from '@/components/Spinner';

const BookingPage = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState<BookingInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin] = useState(localStorage.getItem('role') === 'MASTER');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BACKEND_URL}/api/v1/bookings/details/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            userId: localStorage.getItem('id') || ''
          }
        });
        console.log('Response:', response.data);
        
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to fetch booking');
        }
        
        setBooking(response.data.booking);
      } catch (err:any) {
        console.error('Error details:', err);
        setError(err.response?.data?.message || 'Error fetching booking details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBookingDetails();
    }
  }, [id]);

  const handleCancelBooking = async () => {
    try {
      setIsLoading(true);
      const response = await axios.put(
        `${BACKEND_URL}/api/v1/bookings/cancel/${id}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            userId: localStorage.getItem('id') || '',
          },
        }
      );

      if (response.data.success) {
        setBooking(prev => prev ? {...prev, status: 'CANCELLED'} : null);
        toast.success("Booking cancelled successfully!");
      }
    } catch (err: any) {
      console.error('Error cancelling booking:', err);
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setIsLoading(true);
      const response = await axios.put(
        `${BACKEND_URL}/api/v1/bookings/checkin/${id}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            userId: localStorage.getItem('id') || '',
          },
        }
      );

      if (response.data.success) {
        setBooking(prev => prev ? {...prev, status: 'CHECKED_IN'} : null);
        toast.success("Check-in completed successfully!");
      }
    } catch (err: any) {
      console.error('Error checking in:', err);
      toast.error(err.response?.data?.message || 'Failed to check in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/bookings/checkout/${id}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            userId: localStorage.getItem('id') || '',
          },
        }
      );

      if (response.data.success) {
        setBooking(prev => prev ? {...prev, status: 'CHECKED_OUT'} : null);
        toast.success("Check-out completed successfully!");
      }
    } catch (err: any) {
      console.error('Error checking out:', err);
      toast.error(err.response?.data?.message || 'Failed to check out');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">    
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen p-6">
        <Alert>
          <AlertDescription>Booking not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
    <Appbar />
    <Toaster position="top-center" />
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6 mt-2">
        {/* Booking Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
              <p className="text-sm text-gray-500 mt-1">Booking ID: {booking.id}</p>
            </div>
            <Badge className={
              booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
              booking.status === 'CHECKED_IN' ? 'bg-blue-100 text-blue-800' :
              booking.status === 'CHECKED_OUT' ? 'bg-gray-100 text-gray-800' :
              booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }>
              {booking.status}
            </Badge>
          </div>
        </div>

        {/* Guest Information */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Guest Information</h2>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Guest Name</p>
              <p className="font-medium">{booking.guestName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Number of Guests</p>
              <p className="font-medium">{booking.numberOfGuests}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Contact Number</p>
              <p className="font-medium">{booking.contactNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{booking.contactEmail}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Identity Type</p>
              <p className="font-medium">{booking.identityType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Identity Number</p>
              <p className="font-medium">{booking.identityCard}</p>
            </div>
          </CardContent>
        </Card>

        {/* Room Details */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Room Details</h2>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Room Number</p>
              <p className="font-medium">{booking.room?.number ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="font-medium">{booking.room?.category ?? 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Stay Details */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Stay Details</h2>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Check-in Date</p>
              <p className="font-medium">
                {new Date(booking.checkInDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Check-out Date</p>
              <p className="font-medium">
                {new Date(booking.checkOutDate).toLocaleDateString()}
              </p>
            </div>
            {booking.specialRequests && (
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Referred By</p>
                <p className="font-medium">{booking.specialRequests}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Actions */}
        <div className="flex justify-end space-x-4">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            disabled={isLoading}
          >
            Go Back
          </Button>
          {booking.status === 'PENDING' && (
            <Button 
              className="bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner />
                  Confirming...
                </>
              ) : (
                'Confirm Booking'
              )}
            </Button>
          )}
          {booking.status === 'CONFIRMED' && (
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleCheckIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner />
                  Checking In...
                </>
              ) : (
                'Check In'
              )}
            </Button>
          )}
          {booking.status === 'CHECKED_IN' && (
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleCheckOut}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner />
                  Checking Out...
                </>
              ) : (
                'Check Out'
              )}
            </Button>
          )}
          {isAdmin && booking.status !== 'CANCELLED' && booking.status !== 'CHECKED_OUT' && (
            <Button 
              variant="destructive" 
              onClick={handleCancelBooking}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner  />
                  Cancelling...
                </>
              ) : (
                'Cancel Booking'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default BookingPage;