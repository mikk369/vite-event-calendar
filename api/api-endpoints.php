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
    header("Access-Control-Allow-Origin: https://agilityliit.ee");
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
    //GET INSTA FEED 
    register_rest_route(
        'bookings/v1',
        '/insta_feed',
        array(
            'methods' => 'GET',
            'callback' => 'get_insta_feed',
            'permission_callback' => '__return_true',
        )
    );
}

add_action('rest_api_init', 'register_booking_endpoints');

// API endpoint callback functions GET bookings
function get_all_bookings() {
    global $wpdb;

    $mwvj_bookings = $wpdb->prefix . 'bookings';

    $results = $wpdb->get_results("SELECT * FROM $mwvj_bookings");
    
    // Check if any results were returned
    if (empty($results)) {
        return new WP_Error('no_bookings', 'No bookings found', array('status' => 404));
    }
    return $results;
}

// API endpoint callback functions POST bookings
function post_booking($data) {
    global $wpdb;

    //add table prefix
    $mwvj_bookings = $wpdb->prefix . 'bookings';

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
    $qual_time = sanitize_text_field( $data['qualTime'] );
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
    $status = isset($data['status']) && $data['status'] === 'CLUBEVENT' ? 'CLUBEVENT' : 'PENDING';


    $wpdb->insert(
        $mwvj_bookings,
        array(
            'startDate' => $start_date,
            'endDate' => $end_date,
            'qualTime' => $qual_time,
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'location' => $location,
            'referee' => $referee,
            'info' => $info,
            'competitionClasses' => $competitionClasses,
            'competitionType' => $competitionType,
            'status' => $status, // Set status either PENDING or CLUBEVENT
        )
    );

    // Check if its not clubEvent then send mail
    if(!$data['isClubEvent']) {
        //Send email to CLIENT
        $subject = "Teie võistlus on edukalt registreeritud!";
        $client_message = "
            <html>
                <body style='background-color: #f0f0f0; margin: 0; padding: 0;'>
                    <table width='100%' cellpadding='0' cellspacing='0' style='font-family: Arial, sans-serif; background-color: #f0f0f0; padding: 20px 0;'>
                        <tr>
                            <td align='center'>
                                <table width='600' cellpadding='0' cellspacing='0' style='background-color: #ffffff; border-radius: 8px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);'>
                                    <tr>
                                        <td align='center' style='padding: 20px 0;'>
                                            <img src='https://agilityliit.ee/wp-content/uploads/2024/06/agilityliit_logo_halliga.png' alt='Agilityliit Logo' style='max-width: 200px; height: auto;'>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 20px;'>
                                            <h3>$name,</h3>
                                            <h3>Täname, et registreerisite võistluse.</h3
                                            <h3>Teie registreeritud võistluse info:</h3>
                                            <table width='100%' cellpadding='5' cellspacing='0' style='border-collapse: collapse;'>
                                                <tr><td><strong>Alguskuupäev:</strong> $start_date</td></tr>
                                                <tr><td><strong>Lõppkuupäev:</strong> $end_date</td></tr>
                                                <tr><td><strong>Asukoht:</strong> $location</td></tr>";

                                                if (!empty($referee)) {
                                                    $client_message .= "
                                                    <tr>
                                                        <td>
                                                            <strong>Kohtunik:</strong> $referee
                                                        </td>
                                                    </tr>";
                                                }

                                                if (!empty($info)) {
                                                    $client_message .= "
                                                    <tr>
                                                        <td>
                                                            <strong>Lisainfo:</strong> $info
                                                        </td>
                                                    </tr>";
                                                }

                                                $client_message .= "
                                                <tr>
                                                    <td>
                                                        <strong>Võistlusklassid:</strong> $competitionClasses
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Võistlustüüp:</strong> $competitionType
                                                    </td>
                                                </tr>
                                                <p>
                                                    Teie registreeritud võistlus on ootel, teile saadetakse teavitus kui võistlus on kalendrisse kinnitatud.
                                                </p>
                                                <p>
                                                    Parimate soovidega, Eesti Agilityliit.
                                                </p>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
            </html>";
        $headers = ['Content-Type: text/html; charset=UTF-8'];

        // Check if email was successfully sent
        if (!wp_mail($email, $subject, $client_message, $headers)) {
            return new WP_REST_Response(
                array('error' => 'Broneering salvestati, kuid emaili teavitus ebaõnnestus.'),
                500
            );
        }

        //send email to ADMIN
        $admin_email = 'info@agilityliit.ee';
        $admin_subject = "Uus võistlus registreeritud – kinnitamise ootel.";
        $admin_message = "
            <html>
                <body style='background-color: #f0f0f0; margin: 0; padding: 0;'>
                    <table width='100%' cellpadding='0' cellspacing='0' style='font-family: Arial, sans-serif; background-color: #f0f0f0; padding: 20px 0;'>
                        <tr>
                            <td align='center'>
                                <table width='600' cellpadding='0' cellspacing='0' style='background-color: #ffffff; border-radius: 8px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);'>
                                    <tr>
                                        <td align='center' style='padding: 20px 0;'>
                                            <img src='https://agilityliit.ee/wp-content/uploads/2024/06/agilityliit_logo_halliga.png' alt='Agilityliit Logo' style='max-width: 200px; height: auto;'>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 20px;'>
                                            <h3>Registreeritud võistluse andmed:</h3>
                                            <table width='100%' cellpadding='5' cellspacing='0' style='border-collapse: collapse;'>
                                                <tr>
                                                    <td>
                                                        <strong>Alguskuupäev:</strong> $start_date
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Lõppkuupäev:</strong> $end_date
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Korraldav klubi:</strong> $name
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Email:</strong> $email
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Telefon:</strong> $phone
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Asukoht:</strong> $location
                                                    </td>
                                                </tr>";

                                                if (!empty($referee)) {
                                                    $admin_message .= "
                                                    <tr>
                                                        <td>
                                                            <strong>Kohtunik:</strong> $referee
                                                        </td>
                                                    </tr>";
                                                }

                                                if (!empty($info)) {
                                                    $admin_message .= "
                                                    <tr>
                                                        <td>
                                                            <strong>Lisainfo:</strong> $info
                                                        </td>
                                                    </tr>";
                                                }

                                                $admin_message .= "
                                                <tr>
                                                    <td>
                                                        <strong>Võistlusklassid:</strong> $competitionClasses
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <strong>Võistlustüüp:</strong> $competitionType
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
            </html>";
        $headers = array('Content-Type: text/html; charset=UTF-8');
        wp_mail($admin_email, $admin_subject, $admin_message, $headers);

        return new WP_REST_Response( array('message' => 'Booking added successfully' ), 200 );
    }
}

// API endpoint callback function PATCH booking INFO
function patch_booking_info($data) {
    global $wpdb;

     //add table prefix
     $mwvj_bookings = $wpdb->prefix . 'bookings';

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
        $mwvj_bookings,
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

    //add table prefix
    $mwvj_bookings = $wpdb->prefix . 'bookings';

    // Get the booking ID and the new status from the request
    $params = $data->get_params();  // Use get_params() to get request parameters
    $booking_id = $params['id'];
    $new_status = 'BOOKED';

    // Check if the booking exists and has a PENDING status
    $booking = $wpdb->get_row(
        $wpdb->prepare(
            "SELECT * FROM $mwvj_bookings WHERE id = %d AND status = 'PENDING'",
            $booking_id
        )
    );

    // If booking doesn't exist or it's not PENDING
    if (empty($booking)) {
        return new WP_Error('booking_not_found', 'Booking not found or already processed', array('status' => 404) );
    }

    // Update the status in the database
    $updated = $wpdb->update(
        $mwvj_bookings,
        array( 'status' => $new_status ),  // Set the new status
        array( 'id' => $booking_id ),     // Condition to identify the booking by ID
        array( '%s' ),                   // Format for the new status (string)
        array( '%d' )                    // Format for the booking ID
    );

    if ($updated === false) {
        return new WP_Error('update_failed', 'Failed to update booking status', array('status' => 500));
    }

    // Get client email from the booking
    $client_email = $booking->email;
    $client_name = $booking->name;
    $start_date = $booking->startDate;
    $end_date = $booking->endDate;
    $location = $booking->location;
    $referee = $booking->referee;
    $info = $booking->info;
    $competitionClasses = $booking->competitionClasses;
    $competitionType = $booking->competitionType;

    // Send email notification to the client
    $subject = "Võistlus kinnitatud ja lisatud kalendrisse!";
    $client_status_message = "
    <html>
        <body style='background-color: #f0f0f0; margin: 0; padding: 0;'>
            <table width='100%' cellpadding='0' cellspacing='0' style='font-family: Arial, sans-serif; background-color: #f0f0f0; padding: 20px 0;'>
                <tr>
                    <td align='center'>
                        <table width='600' cellpadding='0' cellspacing='0' style='background-color: #ffffff; border-radius: 8px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);'>
                            <tr>
                                <td align='center' style='padding: 20px 0;'>
                                    <img src='https://agilityliit.ee/wp-content/uploads/2024/06/agilityliit_logo_halliga.png' alt='Agilityliit Logo' style='max-width: 200px; height: auto;'>
                                </td>
                            </tr>
                            <tr>
                                <td style='padding: 20px;'>
                                    <h3>$client_name, teie võistlus on kalendrisse lisatud.</h3>
                                    <h3>Võistluse andmed on järgmised:</h3>
                                    <table width='100%' cellpadding='5' cellspacing='0' style='border-collapse: collapse;'>
                                        <tr><td><strong>Alguskuupäev:</strong> $start_date</td></tr>
                                        <tr><td><strong>Lõppkuupäev:</strong> $end_date</td></tr>
                                        <tr><td><strong>Asukoht:</strong> $location</td></tr>";

                                        // Add conditional kohtunik
                                        if (!empty($referee)) {
                                            $client_status_message .= "
                                            <tr><td><strong>Kohtunik:</strong> $referee</td></tr>";
                                        }

                                        // Add conditional Lisainfo
                                        if (!empty($info)) {
                                            $client_status_message .= "
                                            <tr><td><strong>Lisainfo:</strong> $info</td></tr>";
                                        }

                                        $client_status_message .= "
                                        <tr><td><strong>Võistlusklassid:</strong> $competitionClasses</td></tr>
                                        <tr><td><strong>Võistlustüüp:</strong> $competitionType</td></tr>
                                    </table>
                                    <p>Tänud registreerimast!</p>
                                    <p>Parimate soovidega, Eesti Agilityliit.</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
    </html>";

    $headers = ['Content-Type: text/html; charset=UTF-8'];

    // Send the email
    if (!wp_mail($client_email, $subject, $client_status_message, $headers)) {
        return new WP_Error('email_failed', 'Failed to send client notification email', array('status' => 500));
    }

    return new WP_REST_Response(array('status' => 'success', 'message' => 'Booking status updated'), 200);
}

// Callback function to delete a booking
function delete_booking($data) {
    global $wpdb;

    //add table prefix
    $mwvj_bookings = $wpdb->prefix . 'bookings';

    // Get the booking ID from the URL parameter
    $booking_id = $data['id'];

    // Check if the booking exists
    $booking = $wpdb->get_row($wpdb->prepare("SELECT * FROM $mwvj_bookings WHERE id = %d", $booking_id));

    if (empty($booking)) {
        return new WP_Error('booking_not_found', 'Booking not found.', array('status' => 404));
    }

    // Delete the booking
    $deleted = $wpdb->delete(
        $mwvj_bookings,
        array('id' => $booking_id),
        array('%d') // Format for the ID
    );

    if ($deleted === false) {
        return new WP_Error('delete_failed', 'Failed to delete booking.', array('status' => 500));
    }

    return new WP_REST_Response(array('status' => 'success', 'message' => 'Booking deleted successfully'), 200);
}

//Callback function to get instagram feed
function get_insta_feed() {
  //add token to database options table if its not there already
//     $access_token = 'IGAAYtgGXD9mpBZAE1NRUVsNm1Wcms5bnBLVDIxRnpPdDlBc1pYX2tLRmtCQjFYdVhlc1ZAwSHo5aTRubk44aGEtWTU5MTlGSktWeVBuS1RWVnppZA2FONFNDenZADQnkzZADhYOElqakFTQ2pZAOHJkcndkWG1DUHlKTE9yaHlabl82awZDZD';
//     $result = add_option('instagram_access_token', $access_token);

    // Get the existing token from the database
    $access_token = get_option('instagram_access_token');

    if (empty($access_token)) {
        return new WP_Error('missing_token', 'Instagram access token is missing', array('status' => 400));
    }

    $url = "https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink&access_token={$access_token}&limit=18";
    $response = wp_remote_get($url);

    if (is_wp_error($response)) {
        return new WP_Error('fetch_error', 'Error fetching Instagram feed', array('status' => 500));
    }

    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);

    if (empty($data['data'])) {
        return new WP_Error('no_data', 'No data returned from Instagram', array('status' => 404));
    }

    $filter_data = array_filter($data['data'], function ($post) {
        return $post['media_type'] !== 'VIDEO';
    });

    return rest_ensure_response(array_values($filter_data));
}