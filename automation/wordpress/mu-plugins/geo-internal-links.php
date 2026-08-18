<?php
/**
 * Plugin Name: Geo Internal Links
 * Description: Contextual internal links between the six service pages and the
 *              thirty service-by-city pages. Before this existed, the city pages
 *              received no internal links from anywhere on the site and 29 of 30
 *              had zero impressions in Search Console.
 * Version:     1.0.0
 * Author:      Geo Carpentry
 *
 * Safety notes (see memoria.md section 4):
 *  - No regex runs against the_content here. Blocks are appended by concatenation,
 *    so there is no null-return path that could wipe post content.
 *  - Output only on singular pages in the main query.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Geo_Internal_Links {

	/** WordPress service page slug => service slug used by Geo_Service_City_Pages */
	const SERVICE_MAP = [
		'kitchen'      => 'kitchen-remodeling',
		'bath'         => 'bathroom-remodeling',
		'deck'         => 'deck-building',
		'carpentry'    => 'finish-carpentry',
		'renovation'   => 'home-renovation',
		'construction' => 'general-construction',
	];

	/** Service slug => label shown to a reader */
	const SERVICE_LABEL = [
		'kitchen-remodeling'   => 'Kitchen Remodeling',
		'bathroom-remodeling'  => 'Bathroom Remodeling',
		'deck-building'        => 'Deck Building',
		'finish-carpentry'     => 'Finish Carpentry',
		'home-renovation'      => 'Home Renovation',
		'general-construction' => 'General Construction',
	];

	/** City slug => label shown to a reader */
	const CITY_LABEL = [
		'green-bay' => 'Green Bay',
		'appleton'  => 'Appleton',
		'oshkosh'   => 'Oshkosh',
		'de-pere'   => 'De Pere',
		'howard'    => 'Howard',
	];

	public function __construct() {
		add_filter( 'the_content', [ $this, 'append_links' ], 20 );
		add_action( 'wp_head', [ $this, 'styles' ], 20 );
	}

	/**
	 * Which service page are we on, if any.
	 * Returns the service slug or an empty string.
	 */
	private function current_service_page() {
		// A city page routes through its service host page, so check that first
		// and let current_city_page() handle it instead.
		if ( get_query_var( 'gc_sc_service' ) && get_query_var( 'gc_sc_city' ) ) {
			return '';
		}

		$post = get_post();
		if ( ! $post || 'page' !== $post->post_type ) {
			return '';
		}
		$slug = $post->post_name;

		// Top-level service hub, e.g. /kitchen-remodeling/
		if ( ! $post->post_parent && isset( self::SERVICE_LABEL[ $slug ] ) ) {
			return $slug;
		}

		// Legacy service page under /services/, e.g. /services/kitchen/
		$parent = $post->post_parent ? get_post( $post->post_parent ) : null;
		if ( $parent && 'services' === $parent->post_name && isset( self::SERVICE_MAP[ $slug ] ) ) {
			return self::SERVICE_MAP[ $slug ];
		}

		return '';
	}

	/**
	 * Which service-by-city page are we on, if any.
	 * Returns [ service, city ] or an empty array.
	 */
	private function current_city_page() {
		$service = get_query_var( 'gc_sc_service' );
		$city    = get_query_var( 'gc_sc_city' );
		if ( $service && $city && isset( self::SERVICE_LABEL[ $service ] ) && isset( self::CITY_LABEL[ $city ] ) ) {
			return [ $service, $city ];
		}
		return [];
	}

	private function url( $service, $city ) {
		return home_url( '/' . $service . '/' . $city . '-wi/' );
	}

	private function block( $heading, $intro, $links ) {
		if ( empty( $links ) ) {
			return '';
		}
		$out  = '<nav class="geo-il" aria-label="' . esc_attr( $heading ) . '">';
		$out .= '<h2 class="geo-il__h">' . esc_html( $heading ) . '</h2>';
		if ( $intro ) {
			$out .= '<p class="geo-il__p">' . esc_html( $intro ) . '</p>';
		}
		$out .= '<ul class="geo-il__list">';
		foreach ( $links as $l ) {
			$out .= '<li><a href="' . esc_url( $l['href'] ) . '">' . esc_html( $l['text'] ) . '</a></li>';
		}
		$out .= '</ul></nav>';
		return $out;
	}

	public function append_links( $content ) {
		if ( ! is_singular() || ! in_the_loop() || ! is_main_query() ) {
			return $content;
		}

		$service = $this->current_service_page();
		if ( $service ) {
			$links = [];
			foreach ( self::CITY_LABEL as $city => $city_label ) {
				$links[] = [
					'href' => $this->url( $service, $city ),
					'text' => self::SERVICE_LABEL[ $service ] . ' in ' . $city_label . ', WI',
				];
			}
			return $content . $this->block(
				'Where we do this work',
				'Pick your city for local pricing, permit details and recent projects.',
				$links
			);
		}

		$pair = $this->current_city_page();
		if ( $pair ) {
			list( $service, $city ) = $pair;
			$city_label = self::CITY_LABEL[ $city ];

			$same_service = [];
			foreach ( self::CITY_LABEL as $c => $c_label ) {
				if ( $c === $city ) {
					continue;
				}
				$same_service[] = [
					'href' => $this->url( $service, $c ),
					'text' => self::SERVICE_LABEL[ $service ] . ' in ' . $c_label,
				];
			}

			$same_city = [];
			foreach ( self::SERVICE_LABEL as $s => $s_label ) {
				if ( $s === $service ) {
					continue;
				}
				$same_city[] = [
					'href' => $this->url( $s, $city ),
					'text' => $s_label . ' in ' . $city_label,
				];
			}

			// Point back to the /services/ page, which holds the real content and
			// is the URL we consolidate on. See geo-hub-consolidation.php.
			$parent_slug = array_search( $service, self::SERVICE_MAP, true );
			$back = '';
			if ( $parent_slug ) {
				$back = '<p class="geo-il__back"><a href="' . esc_url( home_url( '/services/' . $parent_slug . '/' ) ) . '">'
					. esc_html( 'All ' . self::SERVICE_LABEL[ $service ] . ' work' ) . '</a></p>';
			}

			return $content
				. $this->block( 'Other work we do in ' . $city_label, '', $same_city )
				. $this->block( self::SERVICE_LABEL[ $service ] . ' in nearby cities', '', $same_service )
				. $back;
		}

		return $content;
	}

	public function styles() {
		if ( ! is_singular() ) {
			return;
		}
		echo '<style id="geo-il-css">'
			. '.geo-il{margin:2.5rem 0;padding:1.5rem;background:#FAF7F0;border-left:4px solid #FF6B00;border-radius:4px}'
			. '.geo-il__h{font-size:1.15rem;margin:0 0 .5rem;color:#1B2A4A}'
			. '.geo-il__p{margin:0 0 1rem;color:#0A0A0A;opacity:.8}'
			. '.geo-il__list{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:.5rem 1.5rem}'
			. '.geo-il__list a{color:#1B2A4A;text-decoration:underline}'
			. '.geo-il__list a:hover{color:#FF6B00}'
			. '.geo-il__back{margin:1rem 0 0}'
			. '</style>';
	}
}

new Geo_Internal_Links();
