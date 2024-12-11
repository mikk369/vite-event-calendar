<?php
/*
Plugin Name: booking dashboard plugin
Version: 1.0
Author: Mike
*/

add_action( 'broneeringu_menu', function() {
    add_menu_page( 
        'Broneeringute leht', // Page title
        'Broneeringute leht', // Menu title
        'manage_options', // Capability required
        'broneeringute_leht', // Menu slug
        'render_custom_admin_page' // Callback function to render page content
    );
});

add_action('admin_menu', 'broneeringu_menu');

// Render custom admin page
function render_custom_admin_page() {
    echo '<div id="custom-admin-page-root"></div>';
}

function enqueue_custom_admin_page_scripts($hook_suffix) {
    if ($hook_suffix !== 'toplevel_page_broneeringute_leht') {
        return;
    }
}

wp_enqueue_script(
    'custom-admin-page-react-app',
    plugin_dir_url(__FILE__) . 'index.js',
    array('wp-element'),
    filemtime(plugin_dir_path(__FILE__) . 'index.js'),
    true
);

wp_enqueue_style(
    'custom-admin-page-react-app',
    plugin_dir_url(__FILE__) . 'App.css',
    array(),
    filemtime(plugin_dir_path(__FILE__) . 'App.css')
);