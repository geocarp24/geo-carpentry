<?php
/**
 * Plugin Name: Geo Hub Consolidation
 * Description: Redirects the six top-level service hub URLs to their real
 *              service pages under /services/. The hubs are byte-for-byte the
 *              same page as each other (2,731 of 2,742 unique words shared),
 *              differing only in title, so six indexed URLs were competing with
 *              each other and with the pages that hold the actual content.
 *
 *              The hub posts stay published on purpose: Geo_Service_City_Pages
 *              looks them up by slug to host the thirty service-by-city pages.
 *              Only the front-end URL redirects, and only when no city is in
 *              the request.
 * Version:     1.0.0
 * Author:      Geo Carpentry
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Geo_Hub_Consolidation {

	/** Hub slug => the service page that should rank instead */
	const CONSOLIDATE = [
		'kitchen-remodeling'   => 'services/kitchen',
		'bathroom-remodeling'  => 'services/bath',
		'deck-building'        => 'services/deck',
		'finish-carpentry'     => 'services/carpentry',
		'home-renovation'      => 'services/renovation',
		'general-construction' => 'services/construction',
	];

	public function __construct() {
		add_action( 'template_redirect', [ $this, 'redirect_hub' ], 1 );
		add_filter( 'surerank_exclude_posts_from_sitemap', [ $this, 'exclude_from_sitemap' ] );
	}

	/**
	 * Keep the hubs out of the sitemap. They now answer 301, and a sitemap full
	 * of redirects is a dirty signal to send a crawler.
	 * Resolved by slug rather than hardcoded IDs so this survives a rebuild.
	 *
	 * KNOWN GAP, 2026-08-18: this filter returns the right six IDs when called
	 * directly (verified with wp eval), but SureRank still lists the hubs after
	 * a forced rebuild of its JSON chunks in wp-content/uploads/surerank/sitemap.
	 * Its chunked generator appears not to run this filter. Left in place
	 * because it is correct and costs nothing if a future version honours it.
	 * Low priority: the 301 makes Google drop those URLs on its own.
	 */
	public function exclude_from_sitemap( $excluded ) {
		if ( ! is_array( $excluded ) ) {
			$excluded = [];
		}
		$ids = get_transient( 'geo_hub_ids' );
		if ( false === $ids ) {
			$ids = [];
			foreach ( array_keys( self::CONSOLIDATE ) as $slug ) {
				$page = get_page_by_path( $slug );
				if ( $page ) {
					$ids[] = (int) $page->ID;
				}
			}
			set_transient( 'geo_hub_ids', $ids, DAY_IN_SECONDS );
		}
		return array_values( array_unique( array_merge( $excluded, $ids ) ) );
	}

	public function redirect_hub() {
		// A service-by-city request routes through the hub post. Those pages are
		// the whole point of this structure, so never redirect them.
		if ( get_query_var( 'gc_sc_city' ) || get_query_var( 'gc_sc_service' ) ) {
			return;
		}

		if ( ! is_page() || is_admin() ) {
			return;
		}

		$post = get_post();
		if ( ! $post || $post->post_parent ) {
			return;
		}

		$slug = $post->post_name;
		if ( ! isset( self::CONSOLIDATE[ $slug ] ) ) {
			return;
		}

		$target = home_url( '/' . self::CONSOLIDATE[ $slug ] . '/' );

		// Never redirect onto ourselves.
		if ( untrailingslashit( $target ) === untrailingslashit( home_url( add_query_arg( [] ) ) ) ) {
			return;
		}

		wp_redirect( $target, 301 );
		exit;
	}
}

new Geo_Hub_Consolidation();
