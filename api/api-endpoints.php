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
function register_bookings_endpoint() {
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
    // POST bookings 
    register_rest_route(
        'bookings/v1',
        '/lisa-broneering',
        array(
            'methods' => 'POST',
            'callback' => 'post_booking',
            'permission_callback' => '__return_true' 
        )
    );
    // UPDATE bookings 
    register_rest_route(
        'bookings/v1',
        '/uuenda-broneeringut/(?P<id>\d+)',  // Including the booking ID in the URL
        array(
            'methods' => 'POST',
            'callback' => 'update_booking_status',
            'permission_callback' => '__return_true'
        )
    );
    
}

add_action('rest_api_init', 'register_bookings_endpoint');

// API endpoint callback functions GET bookings
function get_all_bookings() {
    global $wpdb;
    $table_name = 'bookings';
    $results = $wpdb->get_results("SELECT * FROM $table_name");
    // Check if any results were returned
    if ( empty( $results ) ) {
        return new WP_Error( 'no_bookings', 'No bookings found', array( 'status' => 404 ) );
    }
    return $results;
}

// API endpoint callback functions POST bookings
function post_booking($request) {
    global $wpdb;
    $table_name = 'bookings';

    // Get the data from the request
    $start_date = sanitize_text_field( $request['startDate'] );
    $end_date = sanitize_text_field( $request['endDate'] );
    $name = sanitize_text_field( $request['name'] );
    $email = sanitize_email( $request['email'] );
    $phone = sanitize_text_field( $request['phone'] );
    $location = sanitize_text_field( $request['location'] );
    $referee = sanitize_text_field( $request['referee'] );
    $info = sanitize_textarea_field( $request['info'] );
    $competition_classes = sanitize_text_field( $request['competitionClasses'] );
    $competition_type = sanitize_text_field( $request['competitionType'] );

    $wpdb->insert(
        $table_name,
        array(
            'startdate' => $start_date,
            'enddate' => $end_date,
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'location' => $location,
            'referee' => $referee,
            'info' => $info,
            'competitionclasses' => $competition_classes,
            'competitiontype' => $competition_type,
            'status' => 'PENDING', // Default status
        )
    );
    return new WP_REST_Response( array('message' => 'Booking added successfully' ), 200 );
}

// API endpoint callback functions UPDATE bookings
function update_booking_status($data) {
    global $wpdb;

    // Get the booking ID and the new status from the request
    $booking_id = $data['id'];
    $new_status = $data['status'];  // 'ACCEPTED' or 'DENIED'

    // Validate the status
    if (!in_array($new_status, ['ACCEPTED', 'DENIED'])) {
        return new WP_Error( 'invalid_status', 'Invalid status value', array( 'status' => 400 ) );
    }

    // Check if the booking exists and has a PENDING status
    $booking = $wpdb->get_row(
        $wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}bookings WHERE id = %d AND status = 'PENDING'",
            $booking_id
        )
    );

    if (empty($booking)) {
        return new WP_Error('booking_not_found', 'Booking not found or already processed', array('status' => 404) );
    }

    // Update the status in the database
    $updated = $wpdb->update(
        $wpdb->prefix . 'bookings',
        array( 'status' => $new_status ),  // Set the new status
        array( 'id' => $booking_id ),     // Condition to identify the booking by ID
        array( '%s' ),                   // Format for the new status (string)
        array( '%d' )                    // Format for the booking ID
    );

    if ($updated === false) {
        return new WP_Error('update_failed', 'Failed to update booking status', array( 'status' => 500));
    }

    return rest_ensure_response(array('status' => 'success', 'message' => 'Booking status updated'));
}