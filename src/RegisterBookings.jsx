import React, { useState, useEffect } from 'react';
import ReactCalendar from 'react-calendar';
import axios from 'axios';
import './App.css'

const RegisterBookings = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [error, setError] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    name: '',
    email: '',
    phone: '',
    location: '',
    referee: '',
    info: '',
    competitionClasses: '',
    competitionType: '',
  });

  useEffect(() => {
    if (startDate && endDate && startDate > endDate) {
      setError(true);
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
      if (!startDate || !endDate || startDate > endDate) {
        console.log('Error occurred adding data!');
        return;
      }

        // Add the formatted startDate and endDate to the formData
        const updatedFormData = {
          ...formData,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        };

      // Send the data to WordPress REST API
      await axios.post(
        'https://agilityliit.ee/wp-json/bookings/v1/lisa_broneering', updatedFormData);

      setStartDate(null);
      setEndDate(null);
      setFormData({
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

  return (
    <div className='container'>
      <div className="heading-wrapper">
        <h3 className='heading'>Registreerimine</h3>
      </div>
      <div className='calendar-wrapper'>
        <ReactCalendar
          minDate={new Date()}
          view="month"
          onClickDay={handleDateClick}
          value={[startDate, endDate]} // Highlight selected date range
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
        <p className='date-text'>
          Selected Start Date: {startDate && startDate.toDateString()}
        </p>
        <p className='date-text'>
          Selected End Date: {endDate && endDate.toDateString()}
        </p>
        <p className='date-text'>Korraldav klubi</p>
        <input
          id="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Korraldav klubi"
          className='input'
        />
        <p className='date-text'>E-post</p>
        <input
          id="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="E-post"
          className='input'
        />
        <p className='date-text'>Telefon</p>
        <input
          id="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone"
          className='input'
        />
        <p className='date-text'>Asukoht</p>
        <input
          id="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Asukoht"
          className='input'
        />
        <p className='date-text'>Kohtunik</p>
        <input
          id="referee"
          value={formData.referee}
          onChange={handleChange}
          placeholder="Kohtunik"
          className='input'
        />
        <p className='date-text'>Info</p>
        <input
          id="info"
          value={formData.info}
          onChange={handleChange}
          placeholder="Info"
          className='input'
        />
        <p className='date-text'>Võistlusklassid</p>
        <input
          id="competitionClasses"
          value={formData.competitionClasses}
          onChange={handleChange}
          placeholder="Võistlusklassid"
          className='input'
        />
        <p className='date-text'>Võistlustüüp</p>
        <select
          id="competitionType"
          value={formData.competitionType}
          onChange={handleChange}
          className='input'
        >
          <option value="" disabled>Valige võistlustüüp</option> {/* Default placeholder */}
          <option value="EKL eesti edukamate sportkoerte ja koerajuhtide võistlus">
            EKL eesti edukamate sportkoerte ja koerajuhtide võistlus
          </option>
          <option value="tõuühingu meistrivõitlus">
            Tõuühingu meistrivõitlus
          </option>
          <option value="klubimeistrivõistlus">Klubimeistrivõistlus</option>
          <option value="muu rahvuslik võistlus">Muu rahvuslik võistlus</option>
        </select>
        <button type="submit" className='button'>
          Registreeri
        </button>
      </form>
      )}
    </div>
  );
};

export default RegisterBookings;