import { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BACKEND_URL } from '../config';
import { Appbar } from '@/components/Appbar';

interface Booking {
  id: string;
  guestName: string;
  identityCard: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  totalAmount: number;
  room: {
    number: string;
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-green-500';
    case 'CHECKED_IN':
      return 'bg-blue-500';
    case 'CHECKED_OUT':
      return 'bg-gray-500';
    case 'CANCELLED':
      return 'bg-red-500';
    default:
      return 'bg-gray-300';
  }
};

const BookingsTable = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const userId = localStorage.getItem('id');
        const response = await axios.get(`${BACKEND_URL}/api/v1/bookings/allBookings`, {
          headers: {
            'userid': userId
          }
        });
        if (response.data.success) {
            console.log(response.data.bookings);
          setBookings(response.data.bookings);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch bookings"
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Error fetching bookings"
        });
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter(booking => 
    booking.guestName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
       
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search by guest name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <p className="text-sm text-gray-500">
          Found {filteredBookings.length} bookings
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Guest Name</TableHead>
            <TableHead>Room</TableHead>
            <TableHead>Identity Number</TableHead>
            <TableHead>Check In</TableHead>
            <TableHead>Check Out</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredBookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className="font-medium">{booking.guestName}</TableCell>
              <TableCell>{booking.room?.number}</TableCell>
              <TableCell>{booking.identityCard}</TableCell>
              <TableCell>{format(new Date(booking.checkInDate), 'MMM dd, yyyy')}</TableCell>
              <TableCell>{format(new Date(booking.checkOutDate), 'MMM dd, yyyy')}</TableCell>
              <TableCell><Badge className={`${getStatusColor(booking.status)} text-white`}>{booking.status}</Badge></TableCell>
              <TableCell>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/booking/${booking.id}`)}
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default function Bookings() {
  return (
    <div className="p-6">
         <Appbar />
      <h1 className="text-2xl font-bold my-6 mt-2">Bookings</h1>
      <BookingsTable />
    </div>
  );
}