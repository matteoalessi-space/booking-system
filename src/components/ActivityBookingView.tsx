import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Users, Clock, Calendar } from 'lucide-react';
import { supabase, Activity, Booking, ActivityVariant } from '../lib/supabase';

interface TimeSlotBooking {
  timeSlot: string;
  startTime: string;
  endTime: string;
  totalCapacity: number;
  bookedPeople: number;
  availableSpots: number;
  bookings: Booking[];
}

interface ActivityWithBookings {
  activity: Activity;
  timeSlots: TimeSlotBooking[];
}

export default function ActivityBookingView() {
  const [activitiesData, setActivitiesData] = useState<ActivityWithBookings[]>([]);
  const [expandedSlots, setExpandedSlots] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    setLoading(true);

    const { data: activities } = await supabase
      .from('activities')
      .select('*')
      .eq('is_active', true)
      .order('name');

    const { data: variants } = await supabase
      .from('activity_variants')
      .select('*')
      .eq('is_active', true);

    const { data: bookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('booking_date', selectedDate)
      .in('status', ['confirmed', 'pending'])
      .order('start_time');

    if (!activities) {
      setLoading(false);
      return;
    }

    const activitiesWithBookings: ActivityWithBookings[] = [];

    for (const activity of activities) {
      const activityBookings = bookings?.filter(b => b.activity_id === activity.id) || [];
      const activityVariants = variants?.filter(v => v.activity_id === activity.id) || [];

      const timeSlotMap = new Map<string, TimeSlotBooking>();

      for (const booking of activityBookings) {
        const timeSlotKey = `${booking.start_time}-${booking.end_time}`;

        let variant: ActivityVariant | undefined;
        if (booking.variant_id) {
          variant = activityVariants.find(v => v.id === booking.variant_id);
        }

        const capacity = variant?.max_capacity || activity.max_capacity;

        if (!timeSlotMap.has(timeSlotKey)) {
          timeSlotMap.set(timeSlotKey, {
            timeSlot: `${booking.start_time.substring(0, 5)} - ${booking.end_time.substring(0, 5)}`,
            startTime: booking.start_time,
            endTime: booking.end_time,
            totalCapacity: capacity,
            bookedPeople: 0,
            availableSpots: capacity,
            bookings: [],
          });
        }

        const slot = timeSlotMap.get(timeSlotKey)!;
        slot.bookings.push(booking);
        slot.bookedPeople += booking.number_of_people;
        slot.availableSpots = slot.totalCapacity - slot.bookedPeople;
      }

      const timeSlots = Array.from(timeSlotMap.values()).sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      );

      if (timeSlots.length > 0) {
        activitiesWithBookings.push({
          activity,
          timeSlots,
        });
      }
    }

    setActivitiesData(activitiesWithBookings);
    setLoading(false);
  };

  const toggleSlot = (activityId: string, timeSlot: string) => {
    const key = `${activityId}-${timeSlot}`;
    const newExpanded = new Set(expandedSlots);

    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }

    setExpandedSlots(newExpanded);
  };

  const isSlotExpanded = (activityId: string, timeSlot: string) => {
    return expandedSlots.has(`${activityId}-${timeSlot}`);
  };

  if (loading) {
    return <div className="text-center py-12">Loading bookings...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Bookings by Activity</h1>
          <p className="text-slate-600 mt-1">View bookings organized by activity and time slot</p>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-slate-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
        </div>
      </div>

      {activitiesData.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No bookings found for {selectedDate}</p>
          <p className="text-slate-500 text-sm mt-2">Try selecting a different date</p>
        </div>
      ) : (
        <div className="space-y-6">
          {activitiesData.map(({ activity, timeSlots }) => (
            <div
              key={activity.id}
              className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden"
            >
              <div
                className="p-6 border-b border-slate-200"
                style={{ borderLeftWidth: '4px', borderLeftColor: activity.color }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{activity.name}</h2>
                    {activity.description && (
                      <p className="text-slate-600 text-sm mt-1">{activity.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{activity.duration_minutes} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Max {activity.max_capacity}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-200">
                {timeSlots.map((slot) => {
                  const isExpanded = isSlotExpanded(activity.id, slot.timeSlot);
                  const utilizationPercent = (slot.bookedPeople / slot.totalCapacity) * 100;

                  return (
                    <div key={slot.timeSlot}>
                      <button
                        onClick={() => toggleSlot(activity.id, slot.timeSlot)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center gap-2 min-w-[140px]">
                            <Clock className="h-4 w-4 text-slate-500" />
                            <span className="font-medium text-slate-900">{slot.timeSlot}</span>
                          </div>

                          <div className="flex-1 max-w-md">
                            <div className="flex items-center justify-between mb-1 text-sm">
                              <span className="text-slate-600">
                                {slot.bookedPeople} / {slot.totalCapacity} people booked
                              </span>
                              <span className={`font-medium ${
                                slot.availableSpots === 0
                                  ? 'text-red-600'
                                  : slot.availableSpots <= 2
                                  ? 'text-orange-600'
                                  : 'text-green-600'
                              }`}>
                                {slot.availableSpots} spots left
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  utilizationPercent >= 100
                                    ? 'bg-red-500'
                                    : utilizationPercent >= 80
                                    ? 'bg-orange-500'
                                    : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span>{slot.bookings.length} booking{slot.bookings.length !== 1 ? 's' : ''}</span>
                          </div>
                        </div>

                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="bg-slate-50 px-6 py-4">
                          <div className="space-y-3">
                            {slot.bookings.map((booking) => (
                              <div
                                key={booking.id}
                                className="bg-white rounded-lg p-4 border border-slate-200"
                              >
                                <div className="grid grid-cols-4 gap-4">
                                  <div>
                                    <div className="text-xs text-slate-500 mb-1">Customer</div>
                                    <div className="font-medium text-slate-900">
                                      {booking.customer_name}
                                    </div>
                                    <div className="text-sm text-slate-600">
                                      {booking.customer_email}
                                    </div>
                                    {booking.customer_phone && (
                                      <div className="text-sm text-slate-600">
                                        {booking.customer_phone}
                                      </div>
                                    )}
                                  </div>

                                  <div>
                                    <div className="text-xs text-slate-500 mb-1">People</div>
                                    <div className="flex items-center gap-2">
                                      <Users className="h-4 w-4 text-slate-500" />
                                      <span className="font-medium text-slate-900">
                                        {booking.number_of_people}
                                      </span>
                                    </div>
                                  </div>

                                  <div>
                                    <div className="text-xs text-slate-500 mb-1">Order Reference</div>
                                    <div className="font-mono text-sm text-slate-900">
                                      {booking.shopify_order_id || 'N/A'}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">
                                      {booking.source}
                                    </div>
                                  </div>

                                  <div>
                                    <div className="text-xs text-slate-500 mb-1">Status</div>
                                    <span
                                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        booking.status === 'confirmed'
                                          ? 'bg-green-100 text-green-800'
                                          : booking.status === 'pending'
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}
                                    >
                                      {booking.status}
                                    </span>
                                  </div>
                                </div>

                                {booking.notes && (
                                  <div className="mt-3 pt-3 border-t border-slate-200">
                                    <div className="text-xs text-slate-500 mb-1">Notes</div>
                                    <div className="text-sm text-slate-700">{booking.notes}</div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
