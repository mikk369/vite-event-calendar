# React Calendar App/Plugin

The React Calendar Plugin is a highly customizable and user-friendly tool for integrating interactive calendars into your React applications. 
It offers seamless date selection, event display, and integration with APIs for managing bookings, events, and schedules.

## 🛠️ Tools and Technologies

<div style="display: flex; flex-wrap: wrap;">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white" alt="PHP" />
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/WordPress-21759B?style=for-the-badge&logo=wordpress&logoColor=white" alt="WordPress" />
</div>

---

## Features

- **Interactive Date Selection**: Allows users to select one or multiple dates.
- **Customizable Event Colors**: Differentiate events like `PENDING`, `BOOKED`, or `CLUBEVENT` with unique colors.
- **Dynamic Status Handling**: Supports event statuses and real-time updates.
- **Error Handling**: Displays and removes errors (e.g., invalid date ranges) automatically.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **API Integration**: Easily fetch and display events from external APIs.
- **CMS admin panel**: Second part of the app is getting all data on admin panel where it can be managed.
 ```bash
 https://github.com/mikk369/reactAdminPage.git
 ```

## Installation

### Adding the Calendar to Your React App

1. Clone the repository:
   ```bash
   git clone https://github.com/mikk369/vite-event-calendar.git
   ```
2. Navigate to the project directory:
   ```bash
   cd react-calendar-plugin
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm start
   ```

### Adding Calendar to Wordpress

1. Upload the plugin directory to the /wp-content/plugins/ directory on your WordPress server.
 ```bash
   booking_calendar/booking_calendar.php
   ```
2. Go to your WordPress dashboard, navigate to Plugins → Installed Plugins, and activate the plugin.

### Custom CSS
Customized styles in Wordpress themes css:

```css
/* BIG calendar margin under month names */
.month-title {
    margin: 0 !important;
}

/* reactCalendar MODAL top menu buttons */
.modal-close-button {
	background-color: #0071ff;
	font-size: 0.8rem;
	color: #fff;
}

.modal-close-button:hover {
	background-color: #006aec;
  cursor: pointer; 
	color: #fff;
}

.fc-toolbar.fc-header-toolbar button.fc-button.fc-button-primary {
  background-color: #0071ff;
	color: #fff;
  border: none;
}

.fc-toolbar.fc-header-toolbar button.fc-button.fc-button-primary:hover {
  background-color: #006aec;
}

.react-calendar__month-view__days__day:hover {
	border: none;
	padding: 0;
	box-shadow: none;
}

/* register form inputfield labels  */
.date-info-container .register-lable {
    margin-bottom: 8px;
}

/* register submit button  */
.register-submit-button {
	background-color: #0071ff;
	color: #fff;
}

.register-submit-button:hover {
	background-color: #006aec;
	color: #fff;
	box-shadow: none;
}

.elementor .instagram-post img {
  width: 100%;  
  height: 300px;
  object-fit: cover; 
  border-radius: 8px;
}
```
---

Enjoy using the React Calendar App/Plugin to enhance your applications!

