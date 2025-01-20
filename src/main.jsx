import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import BookingCalendar from './BookingCalendar';
import RegisterBookings from './RegisterBookings';
import axios from 'axios';

const Main = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventBookings = async () => {
      try {
        const response = await axios.get('https://agilityliit.ee/wp-json/bookings/v1/broneeringud');
        const eventBookings = response.data.map((booking) => ({
          title: booking.name,
          start: booking.startDate,
          end: booking.endDate,
          referee: booking.referee,
          competitionClasses: booking.competitionClasses,
          competitionType: booking.competitionType,
          description: booking.info,
          location: booking.location,
          status: booking.status
        }));
        setEvents(eventBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchEventBookings();
  }, []);

  const updateEvents = (newEvent) => {
    setEvents((prevEvents) => [...prevEvents, newEvent]);
  };

  return (
    <div>
      <BookingCalendar 
      events={events}
      loading={loading}
      error={error} />
      <RegisterBookings updateEvents={updateEvents} />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('booking_calendar_root')).render(<Main />);
