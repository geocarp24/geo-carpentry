<?php
/**
 * Plugin Name: Geo Review Shortlink
 * Description: geocarpentry.com/review redirects to the Google Business Profile
 *              review form. Short enough to say on the phone, print on a card or
 *              encode in a QR. The destination can change later without
 *              reprinting anything.
 * Version:     1.0.0
 * Author:      Geo Carpentry
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Geo_Review_Shortlink {

	/** Google Business Profile review form. Place ID ChIJ49c5Tlf7S4QRbXXNI1H0EvQ */
	const TARGET = 'https://g.page/r/CW11zSNR9BL0EBM/review';

	/** Paths that should land on the review form. */
	const PATHS = [ 'review', 'reviews', 'resena', 'resenas' ];

	public function __construct() {
		add_action( 'init', [ $this, 'add_rules' ] );
		add_filter( 'query_vars', [ $this, 'add_var' ] );
		add_action( 'template_redirect', [ $this, 'redirect' ] );
	}

	public function add_rules() {
		foreach ( self::PATHS as $p ) {
			add_rewrite_rule( '^' . $p . '/?$', 'index.php?geo_review=1', 'top' );
		}
	}

	public function add_var( $vars ) {
		$vars[] = 'geo_review';
		return $vars;
	}

	public function redirect() {
		if ( ! get_query_var( 'geo_review' ) ) {
			return;
		}
		// 302 on purpose. This is a doorway to an external form, not a permanent
		// move of a page, and the destination may change.
		wp_redirect( self::TARGET, 302 );
		exit;
	}
}

new Geo_Review_Shortlink();
