import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { supabase, Booking, Activity } from '../lib/supabase';

export default function BookingsView() {
  const [bookings, setBookings] = useState<(Booking & { activity: Activity })[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [bookingsRes, activitiesRes] = await Promise.all([
      supabase
        .from('bookings')
        .select('*, activity:activities(*)')
        .order('booking_date', { ascending: false })
        .order('start_time', { ascending: false }),
      supabase.from('activities').select('*'),
    ]);

    if (bookingsRes.data) setBookings(bookingsRes.data as any);
    if (activitiesRes.data) setActivities(activitiesRes.data);
    setLoading(false);
  };

  const updateBookingStatus = async (id: string, status: string) => {
    await supabase
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    loadData();
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.activity?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesActivity = activityFilter === 'all' || booking.activity_id === activityFilter;

    const today = new Date().toISOString().split('T')[0];
    const bookingDate = booking.booking_date;
    let matchesDate = true;

    if (dateFilter === 'today') {
      matchesDate = bookingDate === today;
    } else if (dateFilter === 'upcoming') {
      matchesDate = bookingDate >= today;
    } else if (dateFilter === 'past') {
      matchesDate = bookingDate < today;
    }

    return matchesSearch && matchesStatus && matchesActivity && matchesDate;
  });

  if (loading) {
    return <div className="text-center py-12">Loading bookings...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Bookings</h1>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={activityFilter}
            onChange={(e) => setActivityFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          >
            <option value="all">All Activities</option>
            {activities.map((activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.name}
              </option>
            ))}
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  People
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-slate-900">{booking.customer_name}</div>
                      <div className="text-sm text-slate-500">{booking.customer_email}</div>
                      {booking.customer_phone && (
                        <div className="text-sm text-slate-500">{booking.customer_phone}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: booking.activity?.color }}
                      />
                      <span className="text-sm font-medium text-slate-900">
                        {booking.activity?.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900">{booking.booking_date}</div>
                    <div className="text-sm text-slate-500">
                      {booking.start_time} - {booking.end_time}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">{booking.number_of_people}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 capitalize">
                      {booking.source}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={booking.status}
                      onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                      className={`text-xs font-medium px-3 py-1 rounded-full border-0 focus:ring-2 focus:ring-slate-900 ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {booking.notes && (
                        <button
                          className="text-sm text-slate-600 hover:text-slate-900 text-left"
                          title={booking.notes}
                        >
                          View Notes
                        </button>
                      )}
                      <div className="text-xs text-slate-500">
                        <div title="Privacy Policy Accepted">
                          Privacy: {booking.privacy_policy_accepted ? '✓ Yes' : '✗ No'}
                        </div>
                        <div title="Marketing Consent">
                          Marketing: {booking.marketing_consent ? '✓ Yes' : '✗ No'}
                        </div>
                        <div title="Waiver Accepted">
                          Waiver: {booking.waiver_accepted ? '✓ Yes' : '✗ No'}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <Filter className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No bookings found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
