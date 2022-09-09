<?php

/**
 * Provide a admin area view for the plugin
 *
 * This file is used to markup the admin-facing aspects of the plugin.
 *
 * @link       https://latempesta.cc/eng.html
 * @since      1.0.0
 *
 * @package    Nft_Gallery
 * @subpackage Nft_Gallery/admin/partials
 */
?>

<div class="wrap">
	<h2><?= __( 'NFT Gallery settings', 'nft-gallery' ) ?></h2>
	<?php settings_errors(); ?>
	<form method="POST" action="options.php" class="card">
		<h3><?= __( 'Objkt parameters', 'nft-gallery' ) ?></h3>
		<?php
			settings_fields( 'nft_gallery_objkt_settings' );
			do_settings_sections( 'nft_gallery_objkt_settings' );
		?>
		<?php submit_button(); ?>
	</form>
	<form method="POST" action="options.php" class="card">
		<h3><?= __( 'Gallery preview', 'nft-gallery' ) ?></h3>
		<?php
			settings_fields( 'nft_gallery_preview_settings' );
			do_settings_sections( 'nft_gallery_preview_settings' );
		?>
		<?php submit_button(); ?>
	</form>
</div>
