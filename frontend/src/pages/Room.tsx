import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRoom } from '@/hooks';
import { Appbar } from '@/components/Appbar';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const RoomDetails = () => {
  const { id } = useParams();
  const { room, loading, error } = useRoom({ id: id || "" });

  const [bookingData, setBookingData] = useState({
    checkInDate: '',
    checkOutDate: '',
    numberOfGuests: 1,
    guestName: '',
    identityCard: '',
    identityType: '',
    contactNumber: '',
    contactEmail: '',
    specialRequests: '',
  });

  const handleBookingSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/v1/bookings/bookingRoom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          userId: localStorage.getItem('id') || '', // Replace with actual user ID handling
        },
        body: JSON.stringify({
          roomId: id,
          ...bookingData,
        }),
      });
      if (response.ok) {
        alert('Booking successful!');
        // Redirect or update UI
      } else {
        const errorData = await response.json();
        alert(`Failed to book room: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error booking room:', error);
      alert('Error booking room');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading room details: {error}</div>;
  if (!room) return <div>Room not found</div>;

  return (
    <div>
      <Appbar />
      <div className="max-w-8xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Room {room.number}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Current Bookings</h2>
                {room.bookings && room.bookings.length > 0 ? (
                  <div className="space-y-2">
                    {room.bookings?.map((booking) => (
                      <div key={booking.id} className="border rounded p-3">
                        <p className="font-medium">{booking.guestName}</p>
                        <p className="text-sm text-gray-600">
                          Check-in: {new Date(booking.checkInDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Check-out: {new Date(booking.checkOutDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">ID: {booking.identityCard}</p>
                        <p className="text-sm text-gray-600">Guests: {booking.numberOfGuests}</p>
                        <p className="text-sm text-gray-600">Status: {booking.status}</p>
                        <Button variant="outline" size="sm" className="mt-2  bg-blue-500 text-white">
                          <Link to={`/booking/${booking.id}`}>View Details</Link>
                        </Button>
                    
                      </div>
                    ))}
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
                      <option value="DRIVER_LICENSE">Driver's License</option>
                      <option value="NATIONAL_ID">National ID</option>
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
                      onChange={(e) => setBookingData({ ...bookingData, checkInDate: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
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
                      onChange={(e) => setBookingData({ ...bookingData, checkOutDate: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
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
                      onChange={(e) => setBookingData({ ...bookingData, numberOfGuests: +e.target.value })}
                      min="1"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
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
                    className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
                  >
                    Confirm Booking
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
