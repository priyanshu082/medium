import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useRoom } from '@/hooks';
import { Appbar } from '@/components/Appbar';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { BACKEND_URL } from '@/config';
import { Spinner } from '@/components/Spinner';
import { toast, Toaster } from 'react-hot-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const RoomDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { room, loading, error } = useRoom({ id: id || "" });
  const [isBooking, setIsBooking] = useState(false);

  const [bookingData, setBookingData] = useState({
    checkInDate: searchParams.get('checkIn') || '',
    checkOutDate: searchParams.get('checkOut') || '',
    numberOfGuests: Number(searchParams.get('numberOfGuests')) || 1,
    guestName: '',
    identityCard: '',
    identityType: '',
    contactNumber: '',
    contactEmail: '',
    specialRequests: '',
  });

  const handleBookingSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsBooking(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/v1/bookings/bookingRoom`, {
        roomId: id,
        ...bookingData
      }, {
        headers: {
          'Content-Type': 'application/json',
          'userId': localStorage.getItem('id')
        }
      });

      if (response.status === 200) {
        toast.success('Booking successful!');
        // Redirect or update UI
      }
    } catch (error) {
      console.error('Error booking room:', error);
      if (axios.isAxiosError(error)) {
        toast.error(`Failed to book room: ${error.response?.data?.message || error.message}`);
      } else {
        toast.error('Error booking room');
      }
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) return <Spinner/>;
  if (error) return <div>Error loading room details: {error}</div>;
  if (!room) return <div>Room not found</div>;

  return (
    <div>
      <Appbar />
      <Toaster position="top-center" />
      <div className="max-w-8xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Room {room.number}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Current Bookings</h2>
                {room.bookings && room.bookings.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Guest Name</TableHead>
                          <TableHead>Check-in</TableHead>
                          <TableHead>Check-out</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {room.bookings?.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell>{booking.guestName}</TableCell>
                            <TableCell>{new Date(booking.checkInDate).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(booking.checkOutDate).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <span className={`text-sm ${
                                booking.status === 'CONFIRMED' ? 'text-green-600' :
                                booking.status === 'CHECKED_IN' ? 'text-blue-600' :
                                booking.status === 'CHECKED_OUT' ? 'text-gray-600' :
                                booking.status === 'CANCELLED' ? 'text-red-600' :
                                'text-yellow-600'
                              }`}>{booking.status}</span>
                            </TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" className="bg-blue-500 text-white">
                                <Link to={`/booking/${booking.id}`}>View Details</Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-gray-500">No current bookings</p>
                )}
              </div>
              <p className="text-gray-600 mb-2">Category: {room.category}</p>
              <p className="text-gray-600 mb-2">Capacity: {room.capacity} guests</p>
              <p className="text-gray-600 mb-2">Status: {room.status}</p>
              <p className="text-gray-600 mb-2">Price per night: ${room.pricePerNight}</p>
            </div>
            <div>
              {room.status === 'AVAILABLE' && (
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="guestName" className="block text-sm font-medium text-gray-700">
                      Guest Name
                    </label>
                    <input
                      type="text"
                      id="guestName"
                      value={bookingData.guestName}
                      onChange={(e) => setBookingData({ ...bookingData, guestName: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="identityType" className="block text-sm font-medium text-gray-700">
                      Identity Type
                    </label>
                    <select
                      id="identityType"
                      value={bookingData.identityType}
                      onChange={(e) => setBookingData({ ...bookingData, identityType: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select</option>
                      <option value="PASSPORT">Passport</option>
                      <option value="NATIONAL_ID">National ID</option>
                      <option value="DRIVER_LICENSE">Driver's License</option>
                      <option value="AADHAR_CARD">Aadhar Card</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="identityCard" className="block text-sm font-medium text-gray-700">
                      Identity Card Number
                    </label>
                    <input
                      type="text"
                      id="identityCard"
                      value={bookingData.identityCard}
                      onChange={(e) => setBookingData({ ...bookingData, identityCard: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="checkInDate" className="block text-sm font-medium text-gray-700">
                      Check-in Date
                    </label>
                    <input
                      type="date"
                      id="checkInDate"
                      value={bookingData.checkInDate}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label htmlFor="checkOutDate" className="block text-sm font-medium text-gray-700">
                      Check-out Date
                    </label>
                    <input
                      type="date"
                      id="checkOutDate"
                      value={bookingData.checkOutDate}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label htmlFor="numberOfGuests" className="block text-sm font-medium text-gray-700">
                      Number of Guests
                    </label>
                    <input
                      type="number"
                      id="numberOfGuests"
                      value={bookingData.numberOfGuests}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      id="contactNumber"
                      value={bookingData.contactNumber}
                      onChange={(e) => setBookingData({ ...bookingData, contactNumber: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      value={bookingData.contactEmail}
                      onChange={(e) => setBookingData({ ...bookingData, contactEmail: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700">
                      Refered by
                    </label>
                    <textarea
                      id="specialRequests"
                      value={bookingData.specialRequests}
                      onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isBooking}
                    className={`w-full px-6 py-3 rounded-lg transition ${
                      isBooking 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    {isBooking ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      'Confirm Booking'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
