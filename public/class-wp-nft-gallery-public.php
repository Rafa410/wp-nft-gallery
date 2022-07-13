<?php

/**
 * The public-facing functionality of the plugin.
 *
 * @link       https://latempesta.cc/eng.html
 * @since      1.0.0
 *
 * @package    Wp_Nft_Gallery
 * @subpackage Wp_Nft_Gallery/public
 */

/**
 * The public-facing functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the public-facing stylesheet and JavaScript.
 *
 * @package    Wp_Nft_Gallery
 * @subpackage Wp_Nft_Gallery/public
 * @author     La Tempesta <rafael@latempesta.cc>
 */
class Wp_Nft_Gallery_Public {

	/**
	 * The ID of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $plugin_name    The ID of this plugin.
	 */
	private $plugin_name;

	/**
	 * The version of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $version    The current version of this plugin.
	 */
	private $version;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @since    1.0.0
	 * @param      string    $plugin_name       The name of the plugin.
	 * @param      string    $version    The version of this plugin.
	 */
	public function __construct( $plugin_name, $version ) {

		$this->plugin_name = $plugin_name;
		$this->version = $version;

	}

	/**
	 * Register the stylesheets for the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_styles() {

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in Wp_Nft_Gallery_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The Wp_Nft_Gallery_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/wp-nft-gallery-public.css', array(), $this->version, 'all' );

	}

	/**
	 * Register the JavaScript for the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_scripts() {

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in Wp_Nft_Gallery_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The Wp_Nft_Gallery_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		wp_register_script( 'polyfill-IntersectionObserver', 'https://polyfill.io/v3/polyfill.min.js?features=es2015%2CIntersectionObserver' );		
		wp_register_script( 'vue', 'https://cdn.jsdelivr.net/npm/vue@2.6/dist/vue.js', array(), null, true );
		wp_register_script( 'bootstrap-vue', 'https://cdn.jsdelivr.net/npm/bootstrap-vue@latest/dist/bootstrap-vue.min.js', array(), null, true );
		wp_register_script( 'bootstrap-vue-icons', 'https://cdn.jsdelivr.net/npm/bootstrap-vue@latest/dist/bootstrap-vue-icons.min.js', array(), null, true );
		wp_register_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/wp-nft-gallery-public.js', array( 'vue', 'wp-i18n' ), $this->version, true );

		// Define some variables to be used in Vue
		wp_localize_script( $this->plugin_name, 'nftGallerySettings', array(
			'site_url' => site_url(),
			'wp_api_url' => esc_url_raw( rest_url() ),
			'objkt_endpoint' => get_option( 'nft_gallery_objkt_endpoint_setting' ),
			'objkt_alias' => get_option( 'nft_gallery_objkt_alias_setting' ),
		) );

	}

	/**
	 * Register shortcodes
	 *
	 * @since    1.0.0
	 */
	function register_shortcodes() {

		// Enqueue registered scripts
		wp_enqueue_script( 'polyfill-IntersectionObserver' );		
		wp_enqueue_script( 'vue' );
		wp_enqueue_script( 'bootstrap-vue' );
		wp_enqueue_script( 'bootstrap-vue-icons' );
		wp_enqueue_script( $this->plugin_name );

		add_shortcode( 'nft_gallery', array( $this, 'shortcode_nft_gallery_handler' ) );
	}

	/**
	 * Generates the content of the [nft_gallery] shortcode
	 * 
	 * @param array $atts Shortcode attributes
	 * 
	 * @return string
	 */
	function shortcode_nft_gallery_handler( $atts ) {

		$atts = shortcode_atts( array(
			'limit' => -1, // Maximum number of items to show
		), $atts, 'nft_gallery' );

		$output = $this->generate_nft_gallery( $atts['limit'] );

		return $output;
	}

	/**
	 * Generates the content of the NFT gallery
	 * 
	 * @return string
	 */
	function generate_nft_gallery( $limit ) {
		$output = '<div id="nft-gallery"></div>';
		return $output;
	}

}
