import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AdminLayout from './components/AdminLayout';
import Dashboard from './components/Dashboard';
import ActivityManager from './components/ActivityManager';
import WorkingHours from './components/WorkingHours';
import BookingsView from './components/BookingsView';
import ShopifySettings from './components/ShopifySettings';
import Login from './components/Login';

function AdminApp() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="text-slate-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'activities':
        return <ActivityManager />;
      case 'working-hours':
        return <WorkingHours />;
      case 'bookings':
        return <BookingsView />;
      case 'shopify':
        return <ShopifySettings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AdminLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </AdminLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AdminApp />
    </AuthProvider>
  );
}

export default App;
