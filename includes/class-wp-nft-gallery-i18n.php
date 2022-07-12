<?php

/**
 * Define the internationalization functionality
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 *
 * @link       https://latempesta.cc/eng.html
 * @since      1.0.0
 *
 * @package    Wp_Nft_Gallery
 * @subpackage Wp_Nft_Gallery/includes
 */

/**
 * Define the internationalization functionality.
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 *
 * @since      1.0.0
 * @package    Wp_Nft_Gallery
 * @subpackage Wp_Nft_Gallery/includes
 * @author     La Tempesta <rafael@latempesta.cc>
 */
class Wp_Nft_Gallery_i18n {


	/**
	 * Load the plugin text domain for translation.
	 *
	 * @since    1.0.0
	 */
	public function load_plugin_textdomain() {

		load_plugin_textdomain(
			'nft-gallery',
			false,
			dirname( dirname( plugin_basename( __FILE__ ) ) ) . '/languages/'
		);

	}



}
