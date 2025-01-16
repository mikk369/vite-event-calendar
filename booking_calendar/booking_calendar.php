<?php
/*
Plugin Name: Booking Calendars
Version: 1.0
Author: Mikk
*/

// No direct access
defined('ABSPATH') or die('No script kiddies please!');

//FontAwesome CDN
function enqueue_fontawesome_cdn() {
    wp_enqueue_style(
        'fontawesome-cdn',
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
        array(),
        null
    );
}
add_action('wp_enqueue_scripts', 'enqueue_fontawesome_cdn');

function custom_calendar_enqueue_scripts() {
      // Enqueue the calendar script only if the calendar shortcode is present on the page
    if (is_page() && has_shortcode(get_post()->post_content, 'calendar')) {
        wp_enqueue_script(
            'custom-calendar-main-js',
            plugin_dir_url(__FILE__) . 'index.js', 
            array('wp-element'),
            filemtime(plugin_dir_path(__FILE__) . 'index.js'),
            true
        );
        
        wp_enqueue_style(
            'custom-calendar-main-css',
            plugin_dir_url(__FILE__) . 'index.css', 
            array(),
            filemtime(plugin_dir_path(__FILE__) . 'index.css')
        );
    }
}

add_action('wp_enqueue_scripts', 'custom_calendar_enqueue_scripts');

function custom_booking_shortcode() {
    return '<div id="booking_calendar_root"></div>';
}

add_shortcode('calendar', 'custom_booking_shortcode');
