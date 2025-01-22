import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import BookingCalendar from './BookingCalendar';
import RegisterBookings from './RegisterBookings';
import axios from 'axios';

const Main = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to handle year navigation
  const currentYear = new Date().getFullYear();

   // Helper function to format the end date
  const adjustEventEnd = (endDate) => {
    if (!endDate) return null;
    return new Date(new Date(endDate).setHours(23, 59, 59, 999)); // Set end date to the end of the day
  };
  
  // Helper function to map events, filter by year, and adjust both start and end dates
  const mapEvents = (events, currentYear) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start);
     const eventEnd = new Date(event.end);

     //only include events that occur in current year or later
     return eventStart.getFullYear() >= currentYear || eventEnd.getFullYear() >= currentYear;
    })
    .map((event) => ({
      ...event,
      end: adjustEventEnd(event.end),
    }));
  };

  //calculate correct start and endtime, filter events based on a specific day
  const filterEventsWithDateRange = (events, selectedYear, monthIndex, day) => {
    const mappedEvents = mapEvents(events, monthIndex);
    return mappedEvents.filter((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      const currentDate = new Date(selectedYear, monthIndex, day);
  
      // Normalize dates by setting the time to midnight (00:00:00)
      eventStart.setHours(0, 0, 0, 0);
      eventEnd.setHours(23, 59, 59, 999);
      currentDate.setHours(0, 0, 0, 0);
  
      // Ensure the current date is valid and falls between the event's start and end dates
      return (
        day &&
        currentDate >= eventStart &&
        currentDate <= eventEnd
      );
    });
  };

  // determine the class name for a day-box 
  const getDayBoxClass = (day, dayEvents) => {
    if (!day) return 'inactive';
    return dayEvents.some((event) => event.status === 'CLUBEVENT')
    ? 'clubevent' : dayEvents.some((event) => event.status === 'BOOKED') ? 
    'booked' : dayEvents.some((event) => event.status === 'PENDING')
    ? 'pending' : '';
  };

  // Function to handle showing event information
  const showEventInfo = (events) => {
    // setHoveredEventInfo(events);
  };

  // Function to handle hiding event information
  const hideEventInfo = () => {
  };

  //Function to render event dots to dayboxes
  const renderDots = (dayEvents) => {
    // Check if CLUBEVENT exists
    const hasClubEvent = dayEvents.some((event) => event.status === 'CLUBEVENT');
    const hasPending = dayEvents.some((event) => event.status === 'PENDING');
    const hasBooked = dayEvents.some((event) => event.status === 'BOOKED');
    const hasBookedCount = dayEvents.filter((event) => event.status === 'BOOKED').length;
  
    // Render dots based on conditions
      return (
        <>
        <div className="dot-container">
          {/* Show blue dot when there is more than 1 BOOKED event */}
          {hasBookedCount > 1 && <div className="booked-dot"></div>}
          {/* Show the yellow dot if there's a PENDING event and either BOOKED or CLUBEVENT exists */}
          {(hasPending && (hasBooked || hasClubEvent)) && <div className="pending-dot"></div>} {/* Yellow dot */}
        
          {/* Show the blue dot ONLY if there’s a BOOKED event AND a CLUBEVENT */}
          {hasClubEvent && hasBooked && <div className="booked-dot"></div>} {/* Blue dot */}
        </div>
        </>
      );
  };

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
      error={error}
      currentYear={currentYear}
      filterEventsWithDateRange={filterEventsWithDateRange}
      mapEvents={mapEvents}
      getDayBoxClass={getDayBoxClass}
      showEventInfo={showEventInfo} 
      hideEventInfo={hideEventInfo}
      renderDots={renderDots}/>
      <RegisterBookings 
      updateEvents={updateEvents}
      events={events}
      filterEventsWithDateRange={filterEventsWithDateRange}
      getDayBoxClass={getDayBoxClass}/>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('booking_calendar_root')).render(<Main />);
