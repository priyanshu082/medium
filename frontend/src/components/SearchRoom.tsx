import React, { useState } from 'react';
import { useTotalRooms } from '@/hooks';
import { RoomInterface } from '@/hooks';
import { Link } from 'react-router-dom';
const SearchRoom = () => {
  const { totalRooms, loading, error } = useTotalRooms();
  const [searchParams, setSearchParams] = useState({
    checkInDate: '',
    checkOutDate: '',
    category: '',
    guests: '',
  });

  const [filteredRooms, setFilteredRooms] = useState<RoomInterface[]>(totalRooms || []);

  React.useEffect(() => {
    if (totalRooms) {
      setFilteredRooms(totalRooms);
    }
  }, [totalRooms]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (Array.isArray(totalRooms)) {
      const filtered = totalRooms.filter((room) => {
        const isCategoryMatch =
          !searchParams.category || room.category === searchParams.category;
        const isGuestMatch =
          !searchParams.guests || room.capacity >= Number(searchParams.guests);
        const isAvailable =
          room.status === 'AVAILABLE' || room.status === 'OCCUPIED'; // Include all for display

        return isCategoryMatch && isGuestMatch && isAvailable;
      });
      setFilteredRooms(filtered);
    }
  };

  const groupByCategory = (rooms: RoomInterface[]) => {
    const categories = ['STANDARD', 'DELUXE', 'SUITE', 'PRESIDENTIAL'];
    const grouped: { [key: string]: RoomInterface[] } = {};

    categories.forEach((category) => {
      grouped[category] = rooms.filter((room) => room.category === category);
    });

    return grouped;
  };

  const groupedRooms = groupByCategory(filteredRooms);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading rooms: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Search Room</h1>

      {/* Search Form */}
      <form className="mb-6" onSubmit={handleSearch}>
        <div className="flex flex-wrap gap-4 mb-4">
          <input
            type="date"
            className="border p-2 rounded w-full md:w-1/4"
            placeholder="Check-in Date"
            value={searchParams.checkInDate}
            onChange={(e) =>
              setSearchParams({ ...searchParams, checkInDate: e.target.value })
            }
          />
          <input
            type="date"
            className="border p-2 rounded w-full md:w-1/4"
            placeholder="Check-out Date"
            value={searchParams.checkOutDate}
            onChange={(e) =>
              setSearchParams({ ...searchParams, checkOutDate: e.target.value })
            }
          />
          <select
            className="border p-2 rounded w-full md:w-1/4"
            value={searchParams.category}
            onChange={(e) =>
              setSearchParams({ ...searchParams, category: e.target.value })
            }
          >
            <option value="">Category</option>
            <option value="STANDARD">Standard</option>
            <option value="DELUXE">Deluxe</option>
            <option value="SUITE">Suite</option>
            <option value="PRESIDENTIAL">Presidential</option>
          </select>
          <input
            type="number"
            className="border p-2 rounded w-full md:w-1/4"
            placeholder="Number of Guests"
            value={searchParams.guests}
            onChange={(e) =>
              setSearchParams({ ...searchParams, guests: e.target.value })
            }
          />
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded" type="submit">
          Search
        </button>
      </form>

      {/* Grouped Room Cards */}
      {Object.keys(groupedRooms).map((category) => (
        <div key={category} className="mb-8 border-2 border-blue-600 rounded-lg p-4 bg-blue-100">
          <h2 className="text-xl font-bold mb-4 text-blue-600">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupedRooms[category].map((room) => (
              <div
                key={room.id}
                className={`border rounded-lg p-2 shadow hover:shadow-lg transition flex flex-row justify-between items-center ${
                  room.status === 'AVAILABLE' ? 'border-green-500 bg-green-100' : 'border-red-500 bg-red-100'
                }`}
              >
                <h3 className="text-lg font-bold mb-2">Room {room.number}</h3>
                <p className="text-gray-600 mb-2">Capacity: {room.capacity} guests</p>
                
                
                {room.status === 'AVAILABLE' && (
                    //add functionality in button when i click it, it will redirect to booking page
                    <Link to={`/room/${room.id}`}>
                  <button className="bg-green-500 text-white px-4 py-2 rounded">
                    Book Now
                  </button>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchRoom;
