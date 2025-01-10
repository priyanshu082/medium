import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../config";

// Interfaces
export interface RoomInterface {
  id: string; // Unique identifier for the room.
  number: string; // Room number as a string (e.g., "101").
  category: 'STANDARD' | 'DELUXE' | 'SUITE'; // Categories in uppercase.
  capacity: number; // Maximum capacity of the room.
  pricePerNight: number; // Cost per night.
  description?: string; // Optional description of the room.
  status: 'AVAILABLE' | 'BOOKED' | 'OCCUPIED'; // Room availability and status.
  amenities: string[]; // List of amenities as strings (e.g., ["WiFi", "Air Conditioning"]).
  createdAt: string; // ISO date string of when the room was created.
  updatedAt: string; // ISO date string of the last update.
  createdById: string; // ID of the user who created the room.
  bookings?: BookingInterface[]; // Optional list of associated bookings.
}


export interface BookingInterface {
  id: string;
  roomId: string;
  guestName: string;
  identityCard: string;
  identityType: 'PASSPORT' | 'NATIONAL_ID' | 'DRIVER_LICENSE' | 'AADHAR_CARD';
  numberOfGuests: number;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number; // Added the total amount field
  status: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED' | 'CHECKED_OUT'; // Booking status as per the Prisma model
  specialRequests?: string; // Optional field
  contactNumber: string;
  contactEmail: string;
  createdAt: string; // Should be a string representation of Date
  updatedAt: string; // Should be a string representation of Date
  bookedBy: string; // user ID who booked
  room?: RoomInterface; // Room object, if included
}


export interface UserInterface {
  id: string;
  role: 'master' | 'admin';
  username: string;
  email: string;
  name?: string;
  bookings?: BookingInterface[];
}

// Hook for fetching total rooms count

// interface UseTotalRoomsReturn {
//   totalRooms: any[];
//   loading: boolean;
//   error: Error | null;
// }

export const useTotalRooms = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [room, setRoom] = useState<RoomInterface[]>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/v1/rooms/total`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      })
      .then((res) => {
        setRoom(res.data.rooms);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching total rooms:", err);
        setError(err.response?.data?.message || "Failed to fetch total rooms");
        setLoading(false);
      });
  }, []);

  return {
    loading,
    room,
    error,
  };
};


// Hook for fetching a single room
export const useRoom = ({ id }: { id: string }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [room, setRoom] = useState<RoomInterface>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/v1/rooms/roomDetails/${id}`, {
        headers: {
          userId: localStorage.getItem("id"),
        },
      })
      .then((res) => {
        setRoom(res.data.room);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching room:", err);
        setError(err.response?.data?.message || "Failed to fetch room");
        setLoading(false);
      });
  }, [id]);

  return {
    loading,
    room,
    error,
  };
};

// Hook for fetching available rooms
export const useAvailableRooms = ({ 
  checkInDate, 
  checkOutDate, 
  category 
}: { 
  checkInDate?: string; 
  checkOutDate?: string; 
  category?: string;
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [rooms, setRooms] = useState<RoomInterface[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!checkInDate) return;

    const queryParams = new URLSearchParams({
      checkInDate,
      ...(checkOutDate && { checkOutDate }),
      ...(category && { category }),
    });

    axios
      .get(`${BACKEND_URL}/api/v1/rooms/available?${queryParams}`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      })
      .then((res) => {
        setRooms(res.data.rooms);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching available rooms:", err);
        setError(err.response?.data?.message || "Failed to fetch available rooms");
        setLoading(false);
      });
  }, [checkInDate, checkOutDate, category]);

  return {
    loading,
    rooms,
    error,
  };
};

// Hook for fetching user bookings
export const useBookings = ({ userId }: { userId?: string } = {}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [bookings, setBookings] = useState<BookingInterface[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = userId 
      ? `${BACKEND_URL}/api/v1/bookings/user/${userId}`
      : `${BACKEND_URL}/api/v1/bookings`;

    axios
      .get(url, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      })
      .then((res) => {
        setBookings(res.data.bookings);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching bookings:", err);
        setError(err.response?.data?.message || "Failed to fetch bookings");
        setLoading(false);
      });
  }, [userId]);

  return {
    loading,
    bookings,
    error,
  };
};

// Hook for fetching user data
export const useUser = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserInterface | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BACKEND_URL}/api/v1/user/profile`, {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });
        setUser(response.data.user);
      } catch (err: any) {
        console.error("Error fetching user data:", err);
        setError(err.response?.data?.message || "Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return {
    loading,
    user,
    error,
  };
};

// Hook for searching bookings
export const useBookingSearch = ({ query }: { query: string }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [bookings, setBookings] = useState<BookingInterface[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setBookings([]);
      setLoading(false);
      return;
    }

    const searchTimeout = setTimeout(() => {
      axios
        .get(`${BACKEND_URL}/api/v1/bookings/search?q=${encodeURIComponent(query)}`, {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        })
        .then((res) => {
          setBookings(res.data.bookings);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error searching bookings:", err);
          setError(err.response?.data?.message || "Failed to search bookings");
          setLoading(false);
        });
    }, 300); // Debounce search requests

    return () => clearTimeout(searchTimeout);
  }, [query]);

  return {
    loading,
    bookings,
    error,
  };
};