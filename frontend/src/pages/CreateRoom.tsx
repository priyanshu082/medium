import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Appbar } from '@/components/Appbar';
import axios from 'axios';
import { BACKEND_URL } from '@/config';

const RoomManagement = () => {
  const [formData, setFormData] = useState({
    number: '',
    category: '',
    capacity: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${BACKEND_URL}/api/v1/rooms/create`, {
        ...formData,
        capacity: parseInt(formData.capacity),
      }, {
        headers: {
          'Content-Type': 'application/json',
          'userId': localStorage.getItem('id')
        }
      });

      setSuccess(true);
      // Navigate to the newly created room's page
      window.location.href = `/room/${response.data.room.id}`;
      
      setFormData({
        number: '',
        category: '',
        capacity: '',
      });
    } catch (err:any) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
        <Appbar />
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hotel Room Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome back, {localStorage.getItem('name') || 'Admin'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {localStorage.getItem('role') || 'Admin'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Room Creation Form */}
          <Card className="w-full">
            <CardHeader>
              <h2 className="text-2xl font-semibold">Create New Room</h2>
              <p className="text-gray-500 text-sm">Add a new room to the hotel inventory</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Room Number (please enter a unique number )</label>
                  <Input
                    required
                    value={formData.number}
                    onChange={(e) => setFormData({...formData, number: e.target.value})}
                    placeholder="e.g., 101"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({...formData, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select room category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KUTIA">KUTIA</SelectItem>
                      <SelectItem value="VIP_ROOM">VIP ROOM</SelectItem>
                      <SelectItem value="SWISS_COTTAGE">SWISS COTTAGE</SelectItem>
                      <SelectItem value="EP_TENT">EP TENT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Capacity</label>
                  <Input
                      type="number"
                      required
                      value={formData.capacity}
                      onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                      placeholder="Max guests"
                      min="1"
                    />
                  </div>


            

                <Button type="submit" className="w-full">
                  Create Room
                </Button>
              </form>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mt-4 bg-green-50 text-green-700 border-green-200">
                  <AlertDescription>Room created successfully!</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats or Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-semibold">Room Preview</h2>
                <p className="text-gray-500 text-sm">Live preview of the room details</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium">{formData.number || 'Room Number'}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.category || 'Category'} Room
                    </p>
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Capacity: {formData.capacity || '0'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RoomManagement;