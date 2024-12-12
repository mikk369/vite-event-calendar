import React from 'react';
import ReactDOM from 'react-dom/client';
import BookingCalendar from './BookingCalendar';
import RegisterBookings from './RegisterBookings';

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <BookingCalendar/>
    <RegisterBookings/>
  </>
);
