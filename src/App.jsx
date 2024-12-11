import './App.css';
import React, { useState } from 'react';

const Calendar = () => {
  const months = [
    'Jaanuar', 'Veebruar', 'Märts', 'Aprill',
    'Mai', 'Juuni', 'Juuli', 'August',
    'September', 'Oktoober', 'November', 'Detsember',
  ];

  months.map((months, i) =>  {
    return (
      <div key={i} className='month-box'>
        {months}
      </div>
    )
  })
};
export default Calendar;


