import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks';
import { 
  Home, 
  Calendar, 
  Users, 
  LogOut, 
//   Settings,
  PlusSquare,
  Search,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Sidebar = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Calendar, label: 'Bookings', path: '/bookings' },
    { icon: Search, label: 'Search', path: '/search' },
    ...(user?.role === 'master' ? [
      { icon: PlusSquare, label: 'Add Room', path: '/rooms/add' },
      { icon: Users, label: 'Users', path: '/users' },
    ] : []),
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="w-64 h-full bg-white border-r p-4">
      <div className="space-y-4">
        {menuItems.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => navigate(item.path)}
          >
            <item.icon size={20} />
            {item.label}
          </Button>
        ))}
        
        <hr className="my-4" />
        
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-red-500 hover:text-red-600"
          onClick={() => {
            localStorage.removeItem('token');
            navigate('/login');
          }}
        >
          <LogOut size={20} />
          Logout
        </Button>
      </div>
    </div>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export { Layout, Sidebar };