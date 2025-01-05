import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import axios from 'axios';
import './App.css';
import './mediaQuerys.css'
// Set the app element for accessibility
Modal.setAppElement('#root');

const BookingCalendar = ({events, loading, error}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [openMonthIndex, setOpenMonthIndex] = useState(null);

  const months = [
    'Jaanuar', 'Veebruar', 'Märts', 'Aprill',
    'Mai', 'Juuni', 'Juuli', 'August',
    'September', 'Oktoober', 'November', 'Detsember',
  ];

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

    // Fill the remaining cells with empty days
    while (daysArray.length < 42) {
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
      .filter((event) => {
        const eventDate = new Date(event.start);
        return (
          eventDate.getFullYear() === selectedYear &&
          eventDate.getMonth() == selectedMonth
        );
      })
      .map((event) => ({
        ...event,
        end: adjustEventEnd(event.end),
      }));
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
  
    // Render dots based on conditions
      return (
        <>
        <div className="dot-container">
          {/* Show the yellow dot if there's a PENDING event and either BOOKED or CLUBEVENT exists */}
          {(hasPending && (hasBooked || hasClubEvent)) && <div className="pending-dot"></div>} {/* Yellow dot */}

          {/* Show the blue dot ONLY if there’s a BOOKED event AND a CLUBEVENT */}
          {hasClubEvent && hasBooked && <div className="booked-dot"></div>} {/* Blue dot */}
        </div>
        </>
      );
  };

  // dateSet function that is triggered whenever the visible date range of the calendar changes.
  const handleDateSet = (dateInfo) => {
     // Calculate the center of the visible range
     const startDate = new Date(dateInfo.start);
     const endDate = new Date(dateInfo.end);
     const centerDate = new Date((startDate.getTime() + endDate.getTime()) / 2);
   
     const newYear = centerDate.getFullYear();
     const newMonth = centerDate.getMonth();
   
     setSelectedYear(newYear);
     setSelectedMonth(newMonth);
  }

  //Give classnames inside fullCalendar events
  const fullCalendarEventNames = (event) => {
      if (event.event.extendedProps.status === 'BOOKED') {
        return ['booked'];
      } else if (event.event.extendedProps.status === 'CLUBEVENT') {
        return ['clubevent'];
      } else if (event.event.extendedProps.status === 'PENDING') {
        return ['pending'];
      }
      return [];
  }

  //Open month-grid on click when in mobile view
  const handleMonthClick = (i) => {
    if( openMonthIndex === i) {
      setOpenMonthIndex(null);
    } else {
      setOpenMonthIndex(i);
    }
  }

  // loading div
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
          <button onClick={() => changeYear(-1)}><i className="fa-solid fa-arrow-left"></i></button>
          <span className="year-title">{selectedYear}</span>
          <button onClick={() => changeYear(1)}><i className="fa-solid fa-arrow-right"></i></button>
        </div>
      <div className="calendar-container">
        {/* Month Boxes */}
        {months.map((month, index) => {
          return (
            <div key={index}  className={`month-box ${openMonthIndex === index ? 'open' : ''}`}>
              <h3 className="month-title" onClick={() => handleMonthClick(index)}>{month} {selectedYear}
                <span className='down-arrow'><i className="fa-solid fa-angle-down"></i></span>
              </h3>
              <div className="month-grid" onClick={() => openModal(index)}>
                <span className="day-header">E</span>
                <span className="day-header">T</span>
                <span className="day-header">K</span>
                <span className="day-header">N</span>
                <span className="day-header">R</span>
                <span className="day-header">L</span>
                <span className="day-header">P</span>

                {/* Render the grid of days for the current month */}
                {generateMonthGrid(index, selectedYear).map((day, i) => {
                  const mappedEvents = mapEvents(events, index);
                  const dayEvents = mappedEvents.filter((event) => {
                    const eventStart = new Date(event.start);
                    const eventEnd = new Date(event.end);
                    return (
                      (eventStart.getDate() <= day && eventEnd.getDate() >= day) && 
                      eventStart.getMonth() === index && eventEnd.getMonth() === index
                    );
                  });

                  return (
                    <div key={i} className={`day-box ${getDayBoxClass(day, dayEvents)}`}
                      onMouseEnter={() => showEventInfo(dayEvents)} 
                      onMouseLeave={hideEventInfo}>
                      {day || ''} {/* Show day number */}
                      {renderDots(dayEvents)}
                      {dayEvents.length > 0 && (
                        <div className="event-tooltip">
                          {dayEvents.map((event, i) => (
                            <div key={i} className={`event-tooltip-info ${event.status.toLowerCase()}`}>
                              <strong>{event.title}</strong>
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
        {selectedMonth !== null && (
          <div className="fullcalendar-container">
            <div className="modal-header">
              <button className="modal-close-button" onClick={closeModal}><i className="fa-solid fa-x"></i></button>
            </div>
            <FullCalendar
              locale="et"
              firstDay={1}
              plugins={[dayGridPlugin]}
              initialView="dayGridMonth"
              height="100%" // Calendar adapts to the container
              initialDate={`${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`}
              events={mapEvents(events, selectedMonth)}
              dayHeaderContent={getDayHeader}
              eventClassNames={fullCalendarEventNames}
              datesSet={handleDateSet}
              eventContent={(eventInfo) => (
                <a href='http://agilitykoer.ee/?controller=competitions' className="event-info-link" target="_blank">
                  <div className='event-info'>
                    <strong>{eventInfo.event.title}</strong>
                    <time dateTime={eventInfo.event.start.toISOString()}>
                      Võistluse algus: {new Date(eventInfo.event.start).toLocaleDateString()}
                    </time>
                    <p>
                      Kohtunik: {eventInfo.event.extendedProps.referee}
                    </p>
                    <p>
                      Võistlusklassid: {eventInfo.event.extendedProps.competitionClasses}
                    </p>
                    <p>
                      Võistlustüüp: {eventInfo.event.extendedProps.status === 'BOOKED' ? 
                      eventInfo.event.extendedProps.competitionType : eventInfo.event.extendedProps.clubCompetitionType}
                    </p>
                    <p>
                      Asukoht: {eventInfo.event.extendedProps.location}
                    </p>
                    <p>
                      {eventInfo.event.extendedProps.description}
                    </p>
                  </div>
                </a>
              )}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BookingCalendar;