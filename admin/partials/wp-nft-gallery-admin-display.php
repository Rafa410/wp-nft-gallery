<?php

/**
 * Provide a admin area view for the plugin
 *
 * This file is used to markup the admin-facing aspects of the plugin.
 *
 * @link       https://latempesta.cc/eng.html
 * @since      1.0.0
 *
 * @package    Wp_Nft_Gallery
 * @subpackage Wp_Nft_Gallery/admin/partials
 */
?>

<div class="wrap">
	<h2><?= __( 'NFT Gallery', 'nft-gallery' ) ?></h2>
    <br>
    <a class="button button-primary" href="<?= admin_url( 'admin.php?page=wp-nft-gallery-settings' ) ?>"><?= __( 'Settings', 'nft-gallery' ) ?></a>
</div>

