<?php
/*
Plugin Name: Booking API Endpoints
Description: Handles booking requests through a custom REST API endpoint.
Version: 1.0
Author: Mikk
*/

// No direct access
defined('ABSPATH') or die('No script kiddies please!');

// Add CORS headers
function add_cors_headers() {
    header("Access-Control-Allow-Origin: https://fbtest.webcodes.ee");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
}
add_action('rest_api_init', 'add_cors_headers', 15);



// registered endpoints 
function register_booking_endpoints() {
    // GET bookings 
    register_rest_route(
        'bookings/v1',
        '/broneeringud',
        array(
            'methods' => 'GET',
            'callback' => 'get_all_bookings',
            'permission_callback' => '__return_true' 
        )
    );
    // POST booking 
    register_rest_route(
        'bookings/v1',
        '/lisa_broneering',
        array(
            'methods' => 'POST',
            'callback' => 'post_booking',
            'permission_callback' => '__return_true' 
        )
    );
    //PACTH booking INFO
    register_rest_route(
        'bookings/v1',
        '/uuenda_broneeringu_infot/(?P<id>\d+)',
        array(
            'methods' => 'PATCH',
            'callback' => 'patch_booking_info',
            'permission_callback' => '__return_true'
        )
    );
    // PACTH booking STATUS
    register_rest_route(
        'bookings/v1',
        '/uuenda_staatust/(?P<id>\d+)',  // Including the booking ID in the URL
        array(
            'methods' => 'PATCH',
            'callback' => 'update_booking_status',
            'permission_callback' => '__return_true'
        )
    );
    //DELETE booking
    register_rest_route(
        'bookings/v1',
        '/kustuta_broneering/(?P<id>\d+)', // URL with booking ID as a parameter
        array(
            'methods' => 'DELETE', // HTTP DELETE method
            'callback' => 'delete_booking',
            'permission_callback' => '__return_true', // Replace with the appropriate permission function
        )
    );
}

add_action('rest_api_init', 'register_booking_endpoints');

// API endpoint callback functions GET bookings
function get_all_bookings() {
    global $wpdb;

    $results = $wpdb->get_results("SELECT * FROM bookings");
    // Check if any results were returned
    if (empty($results)) {
        return new WP_Error('no_bookings', 'No bookings found', array('status' => 404));
    }
    return $results;
}

// API endpoint callback functions POST bookings
function post_booking($data) {
    global $wpdb;

     // Validate required fields
     $required_fields = ['startDate', 'endDate', 'name', 'email', 'phone', 'location', 'competitionType'];
     foreach ($required_fields as $field) {
         if (empty($data[$field])) {
             return new WP_REST_Response(
                 array('error' => "$field is required"),
                 400
             );
         }
     }

     //date validation startDate cant be greater than endDate
     if (strtotime($data['startDate']) > strtotime($data['endDate'])) {
        return new WP_REST_Response(
            array('error' => 'Start date cannot be greater than end date'),
            400
        );
    }
    
    // Get the data from the request
    $start_date = sanitize_text_field( $data['startDate'] );
    $end_date = sanitize_text_field( $data['endDate'] );
    $name = sanitize_text_field( $data['name'] );
    $email = sanitize_email( $data['email'] );
    $phone = sanitize_text_field( $data['phone'] );
    $location = sanitize_text_field( $data['location'] );
    $referee = sanitize_text_field( $data['referee'] );
    $info = sanitize_textarea_field( $data['info'] );
    $competitionClasses = sanitize_text_field( $data['competitionClasses'] );
    $competitionType = sanitize_text_field( $data['competitionType'] );

      // Validate email format
      if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return new WP_REST_Response(
            array('error' => 'Invalid email address'),
            400
        );
    }

    //Default set to PENDING if not CLUBEVENT
    $status = isset($data['isClubEvent']) && $data['isClubEvent'] ? 'CLUBEVENT' : 'PENDING';

    $wpdb->insert(
        'bookings',
        array(
            'startDate' => $start_date,
            'endDate' => $end_date,
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'location' => $location,
            'referee' => $referee,
            'info' => $info,
            'competitionclasses' => $competitionClasses,
            'competitiontype' => $competitionType,
            'status' => $status, // Set status either PENDING or CLUBEVENT
        )
    );
    
    //Send email to CLIENT
    $subject = "Võistluse registreerimise teavitus.";
    $message = "
        <html>
            <body>
                <p>
                    $name,
                </p>
                <p>
                    Täname, et registreerisid võistluse.
                </p>
                <p>
                    Teie võistluse andmed:
                </p>
                <ul style='list-style-type: none'>
                    <li>Alguskuupäev: $start_date</li>
                    <li>Lõppkuupäev: $end_date</li>
                    <li>Asukoht: $location</li>
                    <li>Kohtunik: $referee</li>";
                    // Add conditional Lisainfo
                    if (!empty($info)) {
                        $message .= "<li>Lisainfo: $info</li>";
                    }
                    $message .= "
                    <li>Võistlusklassid: $competitionClasses</li>
                    <li>Võistlustüüp: $competitionType</li>
                </ul>
                <p>
                    Teie registreeritud võistlus on ootel, teile saadetakse teavitus kui võistlus on kalendrisse kinnitatud.
                </p>
                <p>
                    Parimate soovidega, Eesti Agilityliit.
                </p>
            </body>
        </html>";
    $headers = ['Content-Type: text/html; charset=UTF-8'];

     // Check if email was successfully sent
     if (!wp_mail($email, $subject, $message, $headers)) {
        return new WP_REST_Response(
            array('error' => 'Broneering salvestati, kuid emaili teavitus ebaõnnestus.'),
            500
        );
    }

    //send email to ADMIN
    $admin_email = 'info@agilityliit.ee';
    $admin_subject = "Uue võistluse registreerimine vajab kinnitust.";
    $admin_message = "
        <html>
            <body>
                <strong>Võistluse andmed:</strong>
                    <ul style='list-style-type: none; padding: 0;'>
                        <li>Alguskuupäev: $start_date</li>
                        <li>Lõppkuupäev: $end_date</li>
                        <li>Korraldav klubi: $name</li>
                        <li>Email: $email</li>
                        <li>Telefon: $phone</li>
                        <li>Asukoht: $location</li>
                        <li>Kohtunik: $referee</li>";
                        // Add conditional Lisainfo
                        if (!empty($info)) {
                            $admin_message .= "<li>Lisainfo: $info</li>";
                        }
                        $admin_message .= "
                        <li>Võistlusklassid: $competitionClasses</li>
                        <li>Võistlustüüp: $competitionType</li>
                    </ul>
            </body>
        </html>";
    $headers = array('Content-Type: text/html; charset=UTF-8');
    wp_mail($admin_email, $admin_subject, $admin_message, $headers);

    return new WP_REST_Response( array('message' => 'Booking added successfully' ), 200 );
}

// API endpoint callback function PATCH booking INFO
function patch_booking_info($data) {
    global $wpdb;

     // Use get_params() to get request parameters
     $params = $data->get_params();

     $booking_id = $params['id'];  // Booking ID (ensure this is passed in the request)
     $start_date = sanitize_text_field( $params['startDate'] );  // Sanitize text input
     $end_date = sanitize_text_field( $params['endDate'] );
     $name = sanitize_text_field( $params['name'] );
     $email = sanitize_email( $params['email'] );
     $phone = sanitize_text_field( $params['phone'] );
     $location = sanitize_text_field( $params['location'] );
     $referee = sanitize_text_field( $params['referee'] );
     $info = sanitize_textarea_field( $params['info'] );
     $competitionClasses = sanitize_text_field( $params['competitionClasses'] );
     $competitionType = sanitize_text_field( $params['competitionType'] );

    // Update the booking details
    $updated = $wpdb->update(
        'bookings',  // Use prefix to ensure the correct table
        array(
            'startdate' => $start_date,
            'enddate' => $end_date,
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'location' => $location,
            'referee' => $referee,
            'info' => $info,
            'competitionclasses' => $competitionClasses,
            'competitiontype' => $competitionType,
        ),
        array('id' => $booking_id),  // Condition to identify the booking by ID
        array(
            '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s'  // Format for each field
        ),
        array('%d')  // Format for the booking ID
    );

    if($updated === false) {
        return new WP_Error('update_failed', 'Failed to update booking', array('status' => 500));
    }

    return new WP_REST_Response(array('status' => 'success', 'message' => 'Booking details updated'), 200);
}

// API endpoint callback functions UPDATE bookings STATUS
function update_booking_status($data) {
    global $wpdb;

    // Get the booking ID and the new status from the request
    $params = $data->get_params();  // Use get_params() to get request parameters

    $booking_id = $params['id'];
    $new_status = 'BOOKED';

    // Check if the booking exists and has a PENDING status
    $booking = $wpdb->get_row(
        $wpdb->prepare(
            "SELECT * FROM bookings WHERE id = %d AND status = 'PENDING'",
            $booking_id
        )
    );

    // If booking doesn't exist or it's not PENDING
    if (empty($booking)) {
        return new WP_Error('booking_not_found', 'Booking not found or already processed', array('status' => 404) );
    }

    // Update the status in the database
    $updated = $wpdb->update(
        'bookings',
        array( 'status' => $new_status ),  // Set the new status
        array( 'id' => $booking_id ),     // Condition to identify the booking by ID
        array( '%s' ),                   // Format for the new status (string)
        array( '%d' )                    // Format for the booking ID
    );

    if ($updated === false) {
        return new WP_Error('update_failed', 'Failed to update booking status', array('status' => 500));
    }

    return new WP_REST_Response(array('status' => 'success', 'message' => 'Booking status updated'), 200);
}

// Callback function to delete a booking
function delete_booking($data) {
    global $wpdb;

    // Get the booking ID from the URL parameter
    $booking_id = $data['id'];

    // Check if the booking exists
    $booking = $wpdb->get_row($wpdb->prepare("SELECT * FROM bookings WHERE id = %d", $booking_id));

    if (empty($booking)) {
        return new WP_Error('booking_not_found', 'Booking not found.', array('status' => 404));
    }

    // Delete the booking
    $deleted = $wpdb->delete(
        'bookings',
        array('id' => $booking_id),
        array('%d') // Format for the ID
    );

    if ($deleted === false) {
        return new WP_Error('delete_failed', 'Failed to delete booking.', array('status' => 500));
    }

    return new WP_REST_Response(array('status' => 'success', 'message' => 'Booking deleted successfully'), 200);
}