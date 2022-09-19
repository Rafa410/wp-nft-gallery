<?php

/**
 * The admin-specific functionality of the plugin.
 *
 * @link       https://latempesta.cc/eng.html
 * @since      1.0.0
 *
 * @package    Wp_Nft_Gallery
 * @subpackage Wp_Nft_Gallery/admin
 */

/**
 * The admin-specific functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the admin-specific stylesheet and JavaScript.
 *
 * @package    Wp_Nft_Gallery
 * @subpackage Wp_Nft_Gallery/admin
 * @author     La Tempesta <rafael@latempesta.cc>
 */
class Wp_Nft_Gallery_Admin {

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
	 * @param      string    $plugin_name       The name of this plugin.
	 * @param      string    $version    The version of this plugin.
	 */
	public function __construct( $plugin_name, $version ) {

		$this->plugin_name = $plugin_name;
		$this->version = $version;

		add_action( 'admin_menu', array( $this, 'add_plugin_to_admin_menu' ), 9 );
		add_action( 'admin_init', array( $this, 'register_and_build_fields' ));

	}

	/**
	 * Register the stylesheets for the admin area.
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

		wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/wp-nft-gallery-admin.css', array(), $this->version, 'all' );

	}

	/**
	 * Register the JavaScript for the admin area.
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

		wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/wp-nft-gallery-admin.js', array( 'jquery' ), $this->version, false );

	}

	/**
	 * Add the admin menu for the plugin
	 * 
	 * @since 1.0.0
	 */
	 public function add_plugin_to_admin_menu() {
		add_menu_page( 
			$this->plugin_name, 
			__( 'NFT Gallery', 'nft-gallery' ),
			'administrator',
			$this->plugin_name,
			array( $this, 'display_plugin_admin_dashboard' ),
			'dashicons-grid-view',
		);
		
		add_submenu_page( 
			$this->plugin_name, 
			__( 'NFT Gallery settings', 'nft-gallery' ),
			__( 'Settings', 'nft-gallery' ), 
			'administrator', 
			$this->plugin_name . '-settings', 
			array( $this, 'display_plugin_admin_settings' ),
		);

	}

	/**
	 * Display the admin dashboard
	 * 
	 * @since 1.0.0
	 */
	public function display_plugin_admin_dashboard() {
    	require_once 'partials/' . $this->plugin_name . '-admin-display.php';
	}

	/**
	 * Display the admin settings page
	 * 
	 * @since 1.0.0
	 */
	public function display_plugin_admin_settings() {
        $active_tab = $_GET[ 'tab' ] ?? 'general';
        if ( isset( $_GET['error_message'] ) ) {
            add_action( 'admin_notices', array( $this, 'admin_settings_messages' ) );
            do_action( 'admin_notices', $_GET['error_message'] );
        }
        require_once 'partials/' . $this->plugin_name . '-admin-settings-display.php';
	}

	/**
	 * Display the admin settings messages
	 * 
	 * @since 1.0.0
	 */
	public function admin_settings_messages( $error_message ) {
         switch ( $error_message ) {
             case '1':
				$message = __( 'There was an error saving the options. Please try again. If the problem persists, contact the site administrator.', 'nft-gallery' );
				$err_code = esc_attr( 'nft_gallery_objkt_alias_setting' );                 
				$setting_field = 'nft_gallery_objkt_alias_setting';                 
				break;
        }
        $type = 'error';
        add_settings_error(
			$setting_field,
			$err_code,
			$message,
			$type
        );
    }

	/**
	 * Register the settings for the plugin
	 * 
	 * @since 1.0.0
	 */
	public function register_and_build_fields() {

		/**
		 * Gallery preview settings
		 */
		add_settings_section(
			// ID used to identify this section and with which to register options
			'nft_gallery_preview_settings_section',
			// Title to be displayed on the administration page
			'',
			// Callback used to render the description of the section
			array( $this, 'display_gallery_preview_description' ),
			// Page on which to add this section of options
			'nft_gallery_preview_settings'
		);

		// Preview limit
		$args = array(
			'type'              => 'input',
			'subtype'           => 'number',
			'id'                => 'nft_gallery_preview_limit_setting',
			'name'              => 'nft_gallery_preview_limit_setting',
			'get_options_list' => '',
			'value_type' => 'normal',
			'wp_data' => 'option',
			'default_value' => 12,
		);
		add_settings_field(
			'nft_gallery_preview_limit_setting',
			__( 'Number of items to show', 'nft-gallery' ),
			array( $this, 'render_settings_field' ),
			'nft_gallery_preview_settings',
			'nft_gallery_preview_settings_section',
			$args
		);
		register_setting(
			'nft_gallery_preview_settings',
			'nft_gallery_preview_limit_setting'
		);

		/**
		 * Objkt settings section
		 */
		add_settings_section(
			// ID used to identify this section and with which to register options
			'nft_gallery_objkt_section',
			// Title to be displayed on the administration page
			'',  
			// Callback used to render the description of the section
			array( $this, 'display_objkt_description' ),    
			// Page on which to add this section of options
			'nft_gallery_objkt_settings'                   
		);

		// Objkt alias
		unset($args);
		$args = array (
			'type'      => 'input',
			'subtype'   => 'text',
			'id'    => 'nft_gallery_objkt_alias_setting',
			'name'      => 'nft_gallery_objkt_alias_setting',
			'get_options_list' => '',
			'value_type' => 'normal',
			'wp_data' => 'option'
		);
		add_settings_field(
			'nft_gallery_objkt_alias_setting',
			__( 'Objkt alias', 'nft-gallery' ),
			array( $this, 'render_settings_field' ),
			'nft_gallery_objkt_settings',
			'nft_gallery_objkt_section',
			$args
		);
		register_setting(
			'nft_gallery_objkt_settings',
			'nft_gallery_objkt_alias_setting'
		);

		// Objkt collection ID
		unset($args);
		$args = array (
			'type'      => 'input',
			'subtype'   => 'text',
			'id'    => 'nft_gallery_objkt_collection_id_setting',
			'name'      => 'nft_gallery_objkt_collection_id_setting',
			'required' => true,
			'get_options_list' => '',
			'value_type' => 'normal',
			'wp_data' => 'option'
		);
		add_settings_field(
			'nft_gallery_objkt_collection_id_setting',
			__( 'Objkt collection ID', 'nft-gallery' ),
			array( $this, 'render_settings_field' ),
			'nft_gallery_objkt_settings',
			'nft_gallery_objkt_section',
			$args
		);
		register_setting(
			'nft_gallery_objkt_settings',
			'nft_gallery_objkt_collection_id_setting'
		);

		// Objkt endpoint
		unset($args);
		$args = array (
			'type'      => 'input',
			'subtype'   => 'url',
			'id'    => 'nft_gallery_objkt_endpoint_setting',
			'name'      => 'nft_gallery_objkt_endpoint_setting',
			'required' => true,
			'get_options_list' => '',
			'value_type' => 'normal',
			'wp_data' => 'option',
			'default_value' => 'https://data.objkt.com/v2/graphql',
			'placeholder' => 'https://data.objkt.com/v2/graphql',
		);
		add_settings_field(
			'nft_gallery_objkt_endpoint_setting',
			__( 'Objkt endpoint *', 'nft-gallery' ),
			array( $this, 'render_settings_field' ),
			'nft_gallery_objkt_settings',
			'nft_gallery_objkt_section',
			$args
		);
		register_setting(
			'nft_gallery_objkt_settings',
			'nft_gallery_objkt_endpoint_setting'
		);

	}

	/**
	 * Display the Gallery preview settings description
	 */
	function display_gallery_preview_description() {
		echo '<p>' . __( 'Customization options for the gallery preview', 'nft-gallery' ) . '</p>';
	}

	/**
	 * Display the Objkt settings description
	 * 
	 * @since 1.0.0
	 */
	function display_objkt_description() {
		echo '<p>' . __( 'These options are used to connect to the Objkt API.', 'nft-gallery' ) . '</p>';
	}


	/**
	 * Render the settings field
	 * 
	 * @since 1.0.0 
	 * @param array $args Arguments for the field
	 */
	public function render_settings_field( $args ) {
		if ( $args['wp_data'] == 'option' ) {
			$wp_data_value = get_option( $args['name'] );
		} elseif ( $args['wp_data'] == 'post_meta' ) {
			$wp_data_value = get_post_meta( $args['post_id'], $args['name'], true );
		}

		if ( empty( $wp_data_value ) ) {
			$wp_data_value = $args['default_value'];
		}

		switch ( $args['type'] ) {
			case 'input':
				$value =  ( $args['value_type'] ==  'serialized') ? serialize( $wp_data_value ) : $wp_data_value;
				if ( $args['subtype'] != 'checkbox') {
					$prependStart = ( isset( $args['prepend_value'] ) ) ? '<div class="input-prepend"> <span class="add-on">' . $args['prepend_value'] . '</span>' : '';
					$prependEnd = ( isset( $args['prepend_value'] ) ) ? '</div>' : '';
					$step = ( isset( $args['step'] ) ) ? 'step="' . $args['step'] . '"' : '';
					$min = ( isset( $args['min'] ) ) ? 'min="' . $args['min'] . '"' : '';
					$max = ( isset( $args['max'] ) ) ? 'max="' . $args['max'] . '"' : '';
					$placeholder = ( isset( $args['placeholder'] ) ) ? 'placeholder="' . $args['placeholder'] . '"' : '';
					$required = ( isset( $args['required'] ) ) ? 'required' : '';

					if ( isset( $args['disabled'] ) ) {
						// hide the actual input bc if it was just a disabled input the information saved in the database would be wrong - bc it would pass empty values and wipe the actual information
						echo $prependStart . '<input type="' . $args['subtype'] . '" id="' . $args['id'] . '_disabled" ' . $step . ' ' . $max . ' ' . $min . ' ' . $placeholder . ' name="' . $args['name'] . '_disabled" size="40" disabled value="' . esc_attr($value) . '" /><input type="hidden" id="' . $args['id'] . '" ' . $step . ' ' . $max . ' ' . $min . ' name="' . $args['name'] . '" size="40" value="' . esc_attr($value) . '" />' . $prependEnd;
					} else {
						echo $prependStart . '<input type="' . $args['subtype'] . '" id="' . $args['id'] . '" ' . $required . ' ' . $step . ' ' . $max . ' ' . $min . ' ' . $placeholder . ' name="' . $args['name'] . '" size="40" value="' . esc_attr($value) . '" />' . $prependEnd;
					}
					/*<input required="required" ' . $disabled . ' type="number" step="any" id="' . $this->plugin_name . '_cost2" name="' . $this->plugin_name . '_cost2" value="' . esc_attr( $cost ) . '" size="25" /><input type="hidden" id="' . $this->plugin_name . '_cost" step="any" name="' . $this->plugin_name . '_cost" value="' . esc_attr( $cost ) . '" />*/

				} else {
					$checked = ($value) ? 'checked' : '';
					echo '<input type="' . $args['subtype'] . '" id="' . $args['id'] . '" "' . $required . '" name="' . $args['name'] . '" size="40" value="1" ' . $checked . ' />';
				}
				break;
			default:
				break;
		}
	}

}
