import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ActivityBookingView from './ActivityBookingView';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    todayBookings: 0,
    upcomingBookings: 0,
    activeActivities: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const today = new Date().toISOString().split('T')[0];

    const [bookingsRes, todayRes, upcomingRes, activitiesRes] = await Promise.all([
      supabase.from('bookings').select('id', { count: 'exact', head: true }),
      supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('booking_date', today)
        .eq('status', 'confirmed'),
      supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .gte('booking_date', today)
        .eq('status', 'confirmed'),
      supabase
        .from('activities')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),
    ]);

    setStats({
      totalBookings: bookingsRes.count || 0,
      todayBookings: todayRes.count || 0,
      upcomingBookings: upcomingRes.count || 0,
      activeActivities: activitiesRes.count || 0,
    });
    setLoading(false);
  };

  const statCards = [
    {
      label: 'Total Bookings',
      value: stats.totalBookings,
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      label: "Today's Bookings",
      value: stats.todayBookings,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      label: 'Upcoming Bookings',
      value: stats.upcomingBookings,
      icon: Clock,
      color: 'bg-orange-500',
    },
    {
      label: 'Active Activities',
      value: stats.activeActivities,
      icon: Users,
      color: 'bg-purple-500',
    },
  ];

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <ActivityBookingView />
      </div>
    </div>
  );
}
