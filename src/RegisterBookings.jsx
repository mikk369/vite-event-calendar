import React, { useState, useEffect } from 'react';
import ReactCalendar from 'react-calendar';
import axios from 'axios';
import './App.css'

const RegisterBookings = ({updateEvents, events, filterEventsWithDateRange, getDayBoxClass}) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [error, setError] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    organizerName:'',
    name: '',
    email: '',
    phone: '',
    location: '',
    referee: '',
    info: '',
    competitionClasses: '',
    competitionType: '',
  });
  
  // set error and remove it after 3 sec
  useEffect(() => {
    if (startDate && endDate && startDate > endDate) {
      setError(true);
      
      const timer = setTimeout(() => {
        setError(false);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setError(false);
    }
  }, [startDate, endDate]);

  const handleDateClick = (date) => {
    if (!startDate) {
      // If startDate is not set, set the clicked date as startDate
      setStartDate(date);
    } else if (!endDate) {
      // If endDate is not set, set the clicked date as endDate
      setEndDate(date);
    } else {
      // If both startDate and endDate are already set, reset them
      setStartDate(date);
      setEndDate(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

      if (!startDate || !endDate) {
        console.error("Palun valida algus ja lõppkuupäev!");
        alert("Algus ja lõppkuupäev on kohustuslik!");
        return;
      }

      if (!startDate || !endDate || startDate > endDate) {
        console.log('Error occurred adding data!');
        return;
      }

      //enduse date is formatted in local time
      const formatDateToLocal = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

        // Add the formatted startDate and endDate to the formData
        const updatedFormData = {
          ...formData,
          startDate: formatDateToLocal(startDate),
          endDate: formatDateToLocal(endDate),
        };
        
      // Send the data to WordPress REST API
      await axios.post(
        'https://agilityliit.ee/wp-json/bookings/v1/lisa_broneering', updatedFormData);

        updateEvents({
          organizerName: updatedFormData.organizerName,
          name: updatedFormData.name,
          start: updatedFormData.startDate,
          end: updatedFormData.endDate,
          referee: updatedFormData.referee,
          competitionClasses: updatedFormData.competitionClasses,
          competitionType: updatedFormData.competitionType,
          description: updatedFormData.info,
          location: updatedFormData.location,
          status: 'PENDING'
        });

        setStartDate(null);
        setEndDate(null);
        setFormData({
          organizerName: '',
          name: '',
          email: '',
          phone: '',
          location: '',
          referee: '',
          info: '',
          competitionClasses: '',
          competitionType: '',
        });

      console.log('Booking added successfully');
    } catch (error) {
      console.error('Error adding booking:', error);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [id]: value
    }));
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      // Extract the year, month, and day from the date
      const selectedYear = date.getFullYear();
      const monthIndex = date.getMonth();
      const day = date.getDate();
  
      // Use the existing `filterEventsWithDateRange` function
      const dayEvents = filterEventsWithDateRange(events, selectedYear, monthIndex, day);
      // Use your `getDayBoxClass` function to determine the class
      return getDayBoxClass(day, dayEvents);
    }
  
    return ''; // Return an empty string for tiles without events
  };

  return (
    <div id='calendar-register' className='register-container'>
      <h3 className='heading'>Registreerimine</h3>
      <div className="calendar-register-wrapper">
        <div className='calendar-wrapper'>
          <ReactCalendar
            minDate={new Date()}
            locale='et'
            view="month"
            onClickDay={handleDateClick}
            value={[startDate, endDate]}
            tileClassName={tileClassName}
          />
        </div>
        {startDate && endDate && error && (
          <div className='error-container'>
            <h3 className='error-text'>
              Alguskuupäev ei saa olla suurem kui lõppkuupäev
            </h3>
          </div>
        )}
        {!error && (
          <form onSubmit={handleSubmit} className='date-info-container'>
            <h3 className='register-heading'>Kuupäevad valida kalendrist</h3>
            <div className="date-text-wrapper">
              <p className='date-text'>
                Valitud alguskuupäev: {startDate && startDate.toLocaleDateString('et-EE')}
              </p>
              <p className='date-text'>
                Valitud lõppkuupäev: {endDate && endDate.toLocaleDateString('et-EE')}
              </p>
            </div>
          <p className='register-lable'>Peakorraldaja nimi</p>
          <input
            id="organizerName"
            value={formData.organizerName}
            onChange={handleChange}
            className='input'
            required
          />
          <p className='register-lable'>Korraldav klubi</p>
          <input
            id="name"
            value={formData.name}
            onChange={handleChange}
            className='input'
            required
          />
          <p className='register-lable'>E-post</p>
          <input
            id="email"
            value={formData.email}
            onChange={handleChange}
            className='input'
            required
          />
          <p className='register-lable'>Telefon</p>
          <input
            id="phone"
            value={formData.phone}
            onChange={handleChange}
            className='input'
            required
          />
          <p className='register-lable'>Asukoht</p>
          <input
            id="location"
            value={formData.location}
            onChange={handleChange}
            className='input'
            required
          />
          <p className='register-lable'>Kohtunik</p>
          <input
            id="referee"
            value={formData.referee}
            onChange={handleChange}
            className='input'
          />
          <p className='register-lable'>Lisainfo</p>
          <input
            id="info"
            value={formData.info}
            onChange={handleChange}
            className='input'
          />
          <p className='register-lable'>Võistlusklassid</p>
          <input
            id="competitionClasses"
            value={formData.competitionClasses}
            onChange={handleChange}
            placeholder="nt. L - A1, A1... , P - MM, EO kval..."
            className='input'
          />
          <p className='register-lable'>Võistlustüüp</p>
          <select
            id="competitionType"
            value={formData.competitionType}
            onChange={handleChange}
            className='input'
            required
          >
            <option value="" disabled>Valige võistlustüüp</option> {/* Default placeholder */}
            <option value="EKL eesti edukamate sportkoerte ja koerajuhtide võistlus">
              EKL eesti edukamate sportkoerte ja koerajuhtide võistlus
            </option>
            <option value="tõuühingu meistrivõitlus">
              Tõuühingu meistrivõitlus
            </option>
            <option value="klubimeistrivõistlus">Klubimeistrivõistlus</option>
            <option value="muu rahvuslik võistlus">Rahvuslik võistlus</option>
            <option value="CACIAG">CACIAG</option>
          </select>
          <button type="submit" className='register-submit-button'>
            Registreeri
          </button>
        </form>
        )}
      </div>
    </div>
  );
};

export default RegisterBookings;