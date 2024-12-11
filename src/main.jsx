import React from 'react';
import ReactDOM from 'react-dom/client';
import Calendar from './App'; // Adjust the path as needed
import BookingCalendar from './BookingCalendar';
import RegisterBookings from './RegisterBookings';

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <BookingCalendar/>
    <RegisterBookings/>
    </>
);
