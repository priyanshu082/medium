import React, { useState, useEffect } from "react";
import { useTotalRooms } from "@/hooks";
// import { Appbar } from "@/components/Appbar";
import { Link } from "react-router-dom";
import { RoomInterface } from "@/hooks";
import { Spinner } from "./Spinner";



interface BookingFormData {
  checkIn: string;
  checkOut: string;
  numberOfGuests: number;
}

export const SearchRoom = () => {
  const { room , loading, error } = useTotalRooms(); // Changed from { rooms, loading, error }
//   console.log(room);
  const [availableRooms, setAvailableRooms] = useState<RoomInterface[]>([]);
  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    numberOfGuests: 0,
  });

  // Function to filter available rooms based on booking data
  const filterAvailableRooms = (
    rooms: RoomInterface[],
    bookingData: BookingFormData
  ) => {
    
    if (!bookingData.checkIn || !bookingData.checkOut || !bookingData.numberOfGuests) {
      return []; // Return empty array if any required field is missing
    }
    console.log("in filter function");

    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);


    return rooms.filter((room) => {
        // Skip rooms with no capacity for requested guests
        if (room.capacity < bookingData.numberOfGuests) {
            return false;
        }
        
      
        //here is the issue it is skiipping all the rooms even thought the rooms has bookings
        
        // If room has no bookings, it's available
        if (!room.bookings || room.bookings.length === 0) {
            return true;
        }
         console.log(room.number);
        

      // Calculate total guests from overlapping bookings
      let guestsInOverlappingBookings = 0;

      // Check each booking for date overlap
      for (const booking of room.bookings) {
        const bookingStart = new Date(booking.checkInDate);
        const bookingEnd = new Date(booking.checkOutDate);

        // If dates overlap, add guests from that booking
        if ((checkIn >= bookingStart && checkIn < bookingEnd) ||
            (checkOut > bookingStart && checkOut <= bookingEnd) ||
            (checkIn <= bookingStart && checkOut >= bookingEnd)) {
          // Convert booking.numberOfGuests to integer before adding
          guestsInOverlappingBookings += parseInt(String(booking.numberOfGuests));
        }
      }

      // Convert all numbers to integers for consistent comparison
      const totalGuests = guestsInOverlappingBookings + parseInt(String(bookingData.numberOfGuests));
      const roomCapacity = parseInt(String(room.capacity));
      
      console.log("Total guests:", totalGuests, "Room capacity:", roomCapacity);
      return totalGuests <= roomCapacity;
    });
  };

  // Update available rooms whenever bookingData changes
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

  if (loading) return<Spinner/>;
  if (error) return <div>Error loading rooms: {error}</div>;
  if (!room) return <div>No rooms available</div>;

  return (
    <div>
      {/* <Appbar /> */}
      <div className="max-w-8xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Room Availability</h1>

          <form className="space-y-4">
            <div>
              <label
                htmlFor="checkIn"
                className="block text-sm font-medium text-gray-700"
              >
                Check-In Date
              </label>
              <input
                type="date"
                id="checkIn"
                name="checkIn"
                value={bookingData.checkIn}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="checkOut"
                className="block text-sm font-medium text-gray-700"
              >
                Check-Out Date
              </label>
              <input
                type="date"
                id="checkOut"
                name="checkOut"
                value={bookingData.checkOut}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="numberOfGuests"
                className="block text-sm font-medium text-gray-700"
              >
                Number of Guests
              </label>
              <input
                type="number"
                id="numberOfGuests"
                name="numberOfGuests"
                value={bookingData.numberOfGuests}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="1"
                required
              />
            </div>
          </form>

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Available Rooms</h2>
            {availableRooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableRooms.map((room) => (
                  <div key={room.id} className="border rounded p-4 flex flex-row justify-between">
                    <h3 className="text-lg font-bold">Room {room.number}</h3>
                    <p>Category: {room.category}</p>
                    <p>Capacity: {room.capacity} guests</p>
                    {/* <p>Price per night: ${room.pricePerNight}</p> */}
                    {/* <p>Amenities: {room.amenities.join(", ")}</p> */}
                    <Link to={`/room/${room.id}`}>
                  <button className="bg-green-500 text-white px-4 py-2 rounded">
                    Book Now
                  </button>
                  </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Please fill in all fields to see available rooms.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
