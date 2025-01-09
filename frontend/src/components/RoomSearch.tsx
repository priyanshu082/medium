// // import React from 'react';
// import { useState } from 'react';
// //  import { useRooms, useBookings, useAuth } from '@/hooks';
//  import { useRoom } from '@/hooks';
// import { Card, CardHeader, CardContent } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Alert, AlertDescription } from '@/components/ui/alert';

// const RoomSearch = () => {
//   const [searchParams, setSearchParams] = useState({
//     checkInDate: '',
//     checkOutDate: '',
//     category: '',
//     guests: ''
//   });
// const { rooms, loading, error, fetchRooms } = useRoom();

//   const handleSearch = (e) => {
//     e.preventDefault();
//     fetchRooms(searchParams);
//   };

//   return (
//     <Card className="w-full max-w-xl mx-auto">
//       <CardHeader>
//         <h2 className="text-2xl font-bold">Search Rooms</h2>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleSearch} className="space-y-4">
//           <Input
//             type="date"
//             placeholder="Check-in Date"
//             value={searchParams.checkInDate}
//             onChange={(e) => setSearchParams({
//               ...searchParams,
//               checkInDate: e.target.value
//             })}
//           />
//           <Input
//             type="date"
//             placeholder="Check-out Date"
//             value={searchParams.checkOutDate}
//             onChange={(e) => setSearchParams({
//               ...searchParams,
//               checkOutDate: e.target.value
//             })}
//           />
//           <Input
//             type="number"
//             placeholder="Number of Guests"
//             value={searchParams.guests}
//             onChange={(e) => setSearchParams({
//               ...searchParams,
//               guests: e.target.value
//             })}
//           />
//           <Button type="submit" className="w-full">
//             Search Rooms
//           </Button>
//         </form>

//         {loading && <div className="text-center py-4">Loading...</div>}
//         {error && (
//           <Alert variant="destructive" className="mt-4">
//             <AlertDescription>{error}</AlertDescription>
//           </Alert>
//         )}
        
//         <div className="grid gap-4 mt-6">
//           {rooms.map((room) => (
//             <RoomCard key={room.id} room={room} />
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// const RoomCard = ({ room }) => {
//   const { checkAvailability } = useRooms();
//   const [availability, setAvailability] = useState(null);

//   const checkRoomAvailability = async (roomId, dates) => {
//     const result = await checkAvailability(roomId, dates.checkIn, dates.checkOut);
//     setAvailability(result);
//   };

//   return (
//     <Card>
//       <CardContent className="p-4">
//         <h3 className="text-lg font-semibold">{room.category}</h3>
//         <p>Capacity: {room.capacity}</p>
//         <p>Price per night: ${room.pricePerNight}</p>
//         <p>Available spaces: {room.capacity - (availability?.bookedCapacity || 0)}</p>
//         <Button 
//           onClick={() => checkRoomAvailability(room.id, {
//             checkIn: new Date(),
//             checkOut: new Date()
//           })}
//           className="mt-2"
//         >
//           Check Availability
//         </Button>
//       </CardContent>
//     </Card>
//   );
// };

// export default RoomSearch;