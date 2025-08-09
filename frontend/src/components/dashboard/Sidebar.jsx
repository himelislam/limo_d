import { Link } from 'react-router-dom';
import { Home, Users, Car, ClipboardList, Settings } from 'lucide-react';

const sidebarItems = {
  admin: [
    { name: 'Dashboard', icon: Home, path: '/admin/dashboard' },
    { name: 'Users', icon: Users, path: '/admin/users' },
    { name: 'Vehicles', icon: Car, path: '/admin/vehicles' },
    { name: 'Trips', icon: ClipboardList, path: '/admin/trips' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ],
  business_owner: [
    { name: 'Dashboard', icon: Home, path: '/business/dashboard' },
    { name: 'Drivers', icon: Users, path: '/business/drivers' },
    { name: 'Vehicles', icon: Car, path: '/business/vehicles' },
    { name: 'Trips', icon: ClipboardList, path: '/business/trips' },
    { name: 'Settings', icon: Settings, path: '/business/settings' },
  ],
  driver: [
    { name: 'Dashboard', icon: Home, path: '/driver/dashboard' },
    { name: 'My Trips', icon: ClipboardList, path: '/driver/trips' },
  ],
  passenger: [
    { name: 'Dashboard', icon: Home, path: '/passenger/dashboard' },
    { name: 'My Trips', icon: ClipboardList, path: '/passenger/trips' },
  ],
};

export default function Sidebar({ role }) {
  const items = sidebarItems[role] || [];

  return (
    <div className="w-64 bg-white shadow-md">
      <div className="p-4">
        <h1 className="text-xl font-bold">Fleet Management</h1>
      </div>
      <nav className="mt-4">
        {items.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
