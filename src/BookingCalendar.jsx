import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import axios from 'axios';
import './App.css';
// Set the app element for accessibility
Modal.setAppElement('#root');

const BookingCalendar = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [hoveredEventInfo, setHoveredEventInfo] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEventBookings = async () => {
      try {
        const response = await axios.get('https://fbtest.webcodes.ee/wp-json/bookings/v1/broneeringud');
        const eventBookings = response.data.map((booking) => ({
          title: booking.name,
          description: booking.info,
          location: booking.location,
          start: booking.startDate,
          end: booking.endDate,
        }));
        setEvents(eventBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError('Failed to load posts and comments');
      } finally {
        setLoading(false);
      }
    };

    fetchEventBookings();
  }, []);

  const months = [
    'Jaanuar', 'Veebruar', 'Märts', 'Aprill',
    'Mai', 'Juuni', 'Juuli', 'August',
    'September', 'Oktoober', 'November', 'Detsember',
  ];

   // Filter events by the selected year
   const filterEventsByYear = (events, year) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);

      return (
        (eventStart.getFullYear() ===  year || eventEnd.getFullYear() === year) ||
        (eventStart.getFullYear() ===  year -1 && eventEnd.getFullYear() === year) ||
        (eventStart.getFullYear() ===  year && eventEnd.getFullYear() === year + 1)
      )
    });
  };

   // Function to handle year navigation
   const changeYear = (increment) => {
    setSelectedYear((prevYear) => prevYear + increment);
  };

    const openModal = (monthIndex) => {
      setSelectedMonth(monthIndex);
      setModalIsOpen(true);
    };

    const closeModal = () => {
      setModalIsOpen(false);
      setSelectedMonth(null);
    };

    const getDaysInMonth = (month, year) => {
      return new Date(year, month + 1, 0).getDate();
    };

    const getStartDayOfMonth = (month, year) => {
      return new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday, etc.
    };

    const getAdjustedStartDay = (startDay) => {
      return startDay === 0 ? 7 : startDay; // If it's Sunday, treat it as 7
    };

    // Function to create the calendar grid for a specific month
  const generateMonthGrid = (month, year) => {
    const daysInMonth = getDaysInMonth(month, year);
    let startDay = getStartDayOfMonth(month, year);
    startDay = getAdjustedStartDay(startDay);

    const daysArray = [];

    // get previous month  days
    // const prevMonthDays = new Date(year, month, 0).getDate();

    // Fill empty spaces at the start of the month
    for (let i = 1; i < startDay; i++) {
      daysArray.push(null); // Empty spaces for the start of the month
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      daysArray.push(i);
    }

    // Calculate how many empty days are needed to fill up the grid to 42 cells
    // 6 rows × 7 columns = 42 cells
    const totalCells = 42; 
    const remainingCells = totalCells - daysArray.length;

    // Fill the remaining cells with empty days
    for (let i = 1; i < remainingCells; i++) {
      daysArray.push(null);
    }

    return daysArray;
  };

  // Helper function to format the end date
  const adjustEventEnd = (endDate) => {
    if (!endDate) return null;
    return new Date(new Date(endDate).setHours(23, 59, 59, 999)); // Set end date to the end of the day
  };

  // Helper function to get day letters
  const getDayHeader = (arg) => {
    const dayLetters = ['E', 'T', 'K', 'N', 'R', 'L', 'P'];

    return dayLetters[arg.date.getDay() === 0 ? 6 : arg.date.getDay() - 1];
  };

  // Helper function to map events
  const mapEvents = (events, selectedMonth) => {
    
    return events
      .filter((event) => new Date(event.start).getMonth() === selectedMonth)
      .map((event) => ({
        ...event,
        end: adjustEventEnd(event.end),
      }));
  };

  // Function to handle showing event information
  const showEventInfo = (events) => {
    // setHoveredEventInfo(events);
  };

  // Function to handle hiding event information
  const hideEventInfo = () => {
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div id="agility-calendar-wrapper">
        {/* Year Navigation */}
        <div className="year-selector">
          <button onClick={() => changeYear(-1)}>&lt;</button>
          <span className="year-title">{selectedYear}</span>
          <button onClick={() => changeYear(1)}>&gt;</button>
        </div>
      <div className="calendar-container">
        {/* Month Boxes */}
        {months.map((month, index) => {
          const eventsForMonth = filterEventsByYear(events, selectedYear).filter((event) => {
            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end);
            return eventStart.getMonth() === index || eventEnd.getMonth() === index;
          });

          return (
            <div key={index} className="month-box" onClick={() => openModal(index)}>
              <h3 className="month-title">{month} {selectedYear}</h3>
              <div className="month-grid">
                <span className="day-header">E</span>
                <span className="day-header">T</span>
                <span className="day-header">K</span>
                <span className="day-header">N</span>
                <span className="day-header">R</span>
                <span className="day-header">L</span>
                <span className="day-header">P</span>

                {/* Render the grid of days for the current month */}
                {generateMonthGrid(index, selectedYear).map((day, i) => {
                  const dayEvents = eventsForMonth.filter((event) => {
                    const eventStart = new Date(event.start);
                    const eventEnd = new Date(event.end);
                    return (
                      (eventStart.getDate() <= day && eventEnd.getDate() >= day) && 
                      eventStart.getMonth() === index &&
                      eventEnd.getMonth() === index
                    );
                  });

                  return (
                    <div key={i} className={`day-box ${day ? '' : 'inactive'} ${dayEvents.length ? 'booked' : ''}`}
                      onMouseEnter={() => showEventInfo(dayEvents)} onMouseLeave={hideEventInfo}>
                      {day || ''} {/* Show day number */}
                      {dayEvents.length > 0 && (
                        <div className="event-tooltip">
                          {dayEvents.map((event, index) => (
                            <div key={index} className="event-tooltip-info">
                              <strong>{event.title}</strong>
                              <p>{event.description}</p>
                              <small>{event.location}</small>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {/* Modal for detailed monthly view */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Month Details"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <div className="modal-header">
          <button className="modal-close-button" onClick={closeModal}>Close</button>
        </div>
        {selectedMonth !== null && (
          <div className="fullcalendar-container">
            <FullCalendar
              locale="et"
              firstDay={1}
              plugins={[dayGridPlugin]}
              initialView="dayGridMonth"
              height="100%" // Calendar adapts to the container
              initialDate={`${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`}
              events={mapEvents(events, selectedMonth)}
              dayHeaderContent={getDayHeader}
              eventContent={(eventInfo) => (
                <div className='event-info'>
                  <strong>{eventInfo.event.title}</strong>
                  <p>
                    {eventInfo.event.extendedProps.description}
                  </p>
                  <small>
                    {eventInfo.event.extendedProps.location}
                  </small>
                </div>
              )}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BookingCalendar;