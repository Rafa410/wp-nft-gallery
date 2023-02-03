<?php

/**
 * The plugin bootstrap file
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all of the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link              https://latempesta.cc/eng.html
 * @since             1.0.0
 * @package           Wp_Nft_Gallery
 *
 * @wordpress-plugin
 * Plugin Name:       NFT Gallery
 * Plugin URI:        https://github.com/Rafa410/wp-nft-gallery
 * Description:       This is a short description of what the plugin does. It's displayed in the WordPress admin area.
 * Version:           1.0.1
 * Author:            La Tempesta
 * Author URI:        https://latempesta.cc/eng.html
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       nft-gallery
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Currently plugin version.
 * Start at version 1.0.0 and use SemVer - https://semver.org
 * Rename this for your plugin and update it as you release new versions.
 */
define( 'WP_NFT_GALLERY_VERSION', '1.0.1' );

/**
 * The code that runs during plugin activation.
 * This action is documented in includes/class-wp-nft-gallery-activator.php
 */
function activate_wp_nft_gallery() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-wp-nft-gallery-activator.php';
	Wp_Nft_Gallery_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 * This action is documented in includes/class-wp-nft-gallery-deactivator.php
 */
function deactivate_wp_nft_gallery() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-wp-nft-gallery-deactivator.php';
	Wp_Nft_Gallery_Deactivator::deactivate();
}

register_activation_hook( __FILE__, 'activate_wp_nft_gallery' );
register_deactivation_hook( __FILE__, 'deactivate_wp_nft_gallery' );

/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require plugin_dir_path( __FILE__ ) . 'includes/class-wp-nft-gallery.php';

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @since    1.0.0
 */
function run_wp_nft_gallery() {

	$plugin = new Wp_Nft_Gallery();
	$plugin->run();

}
run_wp_nft_gallery();
