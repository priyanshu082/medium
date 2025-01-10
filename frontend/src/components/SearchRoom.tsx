import React, { useState, useEffect } from "react";
import { useTotalRooms } from "@/hooks";
import { Link } from "react-router-dom";
import { RoomInterface } from "@/hooks";
import { Spinner } from "./Spinner";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Toaster } from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface BookingFormData {
  checkIn: string;
  checkOut: string;
  numberOfGuests: number;
}

export const SearchRoom = () => {
  const { room, loading, error } = useTotalRooms();
  const [availableRooms, setAvailableRooms] = useState<RoomInterface[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    numberOfGuests: 0,
  });

  const filterAvailableRooms = (
    rooms: RoomInterface[],
    bookingData: BookingFormData
  ) => {
    if (!bookingData.checkIn || !bookingData.checkOut || !bookingData.numberOfGuests) {
      return [];
    }

    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);

    return rooms.filter((room) => {
      if (room.capacity < bookingData.numberOfGuests) {
        return false;
      }

      if (!room.bookings || room.bookings.length === 0) {
        return true;
      }

      let guestsInOverlappingBookings = 0;

      for (const booking of room.bookings) {
        if (booking.status !== 'CHECKED_IN' && booking.status !== 'CONFIRMED') {
          continue;
        }

        const bookingStart = new Date(booking.checkInDate);
        const bookingEnd = new Date(booking.checkOutDate);

        if ((checkIn >= bookingStart && checkIn < bookingEnd) ||
            (checkOut > bookingStart && checkOut <= bookingEnd) ||
            (checkIn <= bookingStart && checkOut >= bookingEnd)) {
          guestsInOverlappingBookings += parseInt(String(booking.numberOfGuests));
        }
      }

      const totalGuests = guestsInOverlappingBookings + parseInt(String(bookingData.numberOfGuests));
      const roomCapacity = parseInt(String(room.capacity));
      
      return totalGuests <= roomCapacity;
    });
  };

  useEffect(() => {
    if (!loading && room) {
      setAvailableRooms(filterAvailableRooms(room, bookingData));
    }
  }, [room, bookingData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredRooms = availableRooms.filter(room => 
    room.number.toString().includes(searchQuery)
  );

  const groupedRooms = filteredRooms.reduce((acc, room) => {
    const category = room.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(room);
    return acc;
  }, {} as Record<string, RoomInterface[]>);

  if (loading) return <Spinner/>;
  if (error) return <div>Error loading rooms: {error}</div>;
  if (!room) return <div>No rooms available</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      <div className="container mx-auto px-4 py-8">
        <Card className="shadow-lg">
          <CardHeader>
            <h1 className="text-3xl font-bold tracking-tight">Search Available Rooms</h1>
            <p className="text-sm text-muted-foreground">Find and book your perfect room</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="search">Room Number</Label>
                <Input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search by room number..."
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkIn">Check-In Date</Label>
                <Input
                  type="date"
                  id="checkIn"
                  name="checkIn"
                  value={bookingData.checkIn}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkOut">Check-Out Date</Label>
                <Input
                  type="date"
                  id="checkOut"
                  name="checkOut"
                  value={bookingData.checkOut}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numberOfGuests">Number of Guests</Label>
                <Input
                  type="number"
                  id="numberOfGuests"
                  name="numberOfGuests"
                  value={bookingData.numberOfGuests}
                  onChange={handleInputChange}
                  min="1"
                  required
                  className="w-full"
                />
              </div>
            </div>

            <Separator className="my-8" />

            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold tracking-tight">Available Rooms</h2>
                <Badge variant="secondary">
                  {Object.values(groupedRooms).flat().length} rooms found
                </Badge>
              </div>

              {Object.entries(groupedRooms).length > 0 ? (
                Object.entries(groupedRooms).map(([category, rooms]) => (
                  <div key={category} className="space-y-4">
                    <h3 className="text-xl font-semibold capitalize">{category}</h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {rooms.map((room) => (
                        <Card key={room.id} className="overflow-hidden transition-all hover:shadow-lg">
                          <CardContent className="p-6">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="text-lg font-bold">Room {room.number}</h4>
                                <Badge>{room.category}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Capacity: {room.capacity} guests
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Price: ${room.pricePerNight}/night
                              </p>
                            </div>
                          </CardContent>
                          <CardFooter className="bg-gray-50 p-4">
                            <Link 
                              to={`/room/${room.id}?checkIn=${bookingData.checkIn}&checkOut=${bookingData.checkOut}&numberOfGuests=${bookingData.numberOfGuests}`}
                              className="w-full"
                            >
                              <Button className="w-full" variant="default">
                                Book Now
                              </Button>
                            </Link>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    Please fill in all fields to see available rooms
                  </p>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
