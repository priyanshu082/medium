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
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

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
      <div className="container mx-auto p-4 bg-gray-50">
        <Card className="bg-white">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold mb-4">Room {room.number}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4 bg-white rounded-sm p-1">
                  <h2 className="text-xl font-semibold mb-2">Current Bookings</h2>
                  {room.bookings && room.bookings.length > 0 ? (
                    <div className="space-y-2">
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
                                <span className={cn(
                                  "text-sm",
                                  booking.status === 'CONFIRMED' && "text-green-600",
                                  booking.status === 'CHECKED_IN' && "text-blue-600", 
                                  booking.status === 'CHECKED_OUT' && "text-gray-600",
                                  booking.status === 'CANCELLED' && "text-red-600",
                                  booking.status === 'PENDING' && "text-yellow-600"
                                )}>{booking.status}</span>
                              </TableCell>
                              <TableCell>
                                <Button variant="default" size="sm" asChild>
                                  <Link to={`/booking/${booking.id}`}>View Details</Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No current bookings</p>
                  )}
                </div>
                <p className="text-muted-foreground mb-2">Category: {room.category}</p>
                <p className="text-muted-foreground mb-2">Capacity: {room.capacity} guests</p>
                <p className="text-muted-foreground mb-2">Status: {room.status}</p>
                <p className="text-muted-foreground mb-2">Price per night: ${room.pricePerNight}</p>
              </div>
              <div>
                {room.status === 'AVAILABLE' && (
                  <form onSubmit={handleBookingSubmit} className="space-y-4 bg-white rounded-sm p-2">
                    <div className="space-y-2">
                      <Label htmlFor="guestName">Guest Name</Label>
                      <Input
                        id="guestName"
                        value={bookingData.guestName}
                        onChange={(e) => setBookingData({ ...bookingData, guestName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="identityType">Identity Type</Label>
                      <Select 
                        value={bookingData.identityType}
                        onValueChange={(value) => setBookingData({ ...bookingData, identityType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select identity type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PASSPORT">Passport</SelectItem>
                          <SelectItem value="NATIONAL_ID">National ID</SelectItem>
                          <SelectItem value="DRIVER_LICENSE">Driver's License</SelectItem>
                          <SelectItem value="AADHAR_CARD">Aadhar Card</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="identityCard">Identity Card Number</Label>
                      <Input
                        id="identityCard"
                        value={bookingData.identityCard}
                        onChange={(e) => setBookingData({ ...bookingData, identityCard: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="checkInDate">Check-in Date</Label>
                      <Input
                        type="date"
                        id="checkInDate"
                        value={bookingData.checkInDate}
                        disabled
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="checkOutDate">Check-out Date</Label>
                      <Input
                        type="date"
                        id="checkOutDate"
                        value={bookingData.checkOutDate}
                        disabled
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="numberOfGuests">Number of Guests</Label>
                      <Input
                        type="number"
                        id="numberOfGuests"
                        value={bookingData.numberOfGuests}
                        disabled
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactNumber">Contact Number</Label>
                      <Input
                        type="tel"
                        id="contactNumber"
                        value={bookingData.contactNumber}
                        onChange={(e) => setBookingData({ ...bookingData, contactNumber: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        type="email"
                        id="contactEmail"
                        value={bookingData.contactEmail}
                        onChange={(e) => setBookingData({ ...bookingData, contactEmail: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specialRequests">Referred by</Label>
                      <Textarea
                        id="specialRequests"
                        value={bookingData.specialRequests}
                        onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                      />
                    </div>

                    <Button 
                      type="submit"
                      disabled={isBooking}
                      className="w-full"
                    >
                      {isBooking ? (
                        <>
                          <Spinner />
                          Processing...
                        </>
                      ) : (
                        'Confirm Booking'
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
