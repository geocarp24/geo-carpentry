<?php
/**
 * Plugin Name: Geo Carpentry — Service x City Programmatic SEO Pages
 * Description: Self-contained mu-plugin for 30 programmatic SEO landing pages
 *              (6 services x 5 NE Wisconsin cities). Handles URL routing,
 *              page template loading, page-specific GeneralContractor schema
 *              (with city-targeted areaServed), FAQPage schema, and
 *              BreadcrumbList schema. Works with ANY active theme (Astra,
 *              child, or other). Does NOT touch functions.php — fully isolated.
 * Version: 1.1.0
 * Author: Claude Code (Bucket B — refactored for safety)
 *
 * Architecture (all in mu-plugins, no theme dependency):
 *   1. add_rewrite_rules() — maps /{service}/{city}-wi/ to query vars
 *   2. route_to_page() — looks up WP page by postmeta on main query
 *   3. template_include filter — loads page-service-city template from this plugin
 *   4. emit_page_schema() — page-specific GeneralContractor with city areaServed
 *   5. emit_faq_schema() — FAQPage from _gc_faq_jsonld postmeta
 *   6. emit_breadcrumb_schema() — Home > Services > {Service} > {City}, WI
 *
 * Coexistence with WPCode global GeneralContractor schema: the page-specific
 * schema fires alongside; Google uses the more specific one for local SEO.
 *
 * After deploy: flush rewrite rules once with `wp rewrite flush --hard`.
 *
 * Created: 2026-05-27
 */

if ( ! defined( 'ABSPATH' ) ) exit;

class Geo_Service_City_Pages {

    const SERVICES = [
        'kitchen-remodeling',
        'bathroom-remodeling',
        'deck-building',
        'finish-carpentry',
        'home-renovation',
        'general-construction',
    ];

    const CITIES = [
        'green-bay',
        'appleton',
        'oshkosh',
        'de-pere',
        'howard',
    ];

    public function __construct() {
        add_action( 'init', [ $this, 'add_rewrite_rules' ] );
        add_filter( 'query_vars', [ $this, 'register_query_vars' ] );
        add_action( 'pre_get_posts', [ $this, 'route_to_page' ] );
        add_filter( 'template_include', [ $this, 'load_template' ], 99 );
        add_action( 'wp_head', [ $this, 'emit_page_schema' ], 5 );
        add_action( 'wp_head', [ $this, 'emit_faq_schema' ], 6 );
        add_action( 'wp_head', [ $this, 'emit_breadcrumb_schema' ], 7 );
    }

    // ---------- URL ROUTING ----------

    public function add_rewrite_rules() {
        $services = implode( '|', array_map( 'preg_quote', self::SERVICES ) );
        $cities   = implode( '|', array_map( 'preg_quote', self::CITIES ) );

        add_rewrite_rule(
            '^(' . $services . ')/(' . $cities . ')-wi/?$',
            'index.php?gc_sc_service=$matches[1]&gc_sc_city=$matches[2]',
            'top'
        );
    }

    public function register_query_vars( $vars ) {
        $vars[] = 'gc_sc_service';
        $vars[] = 'gc_sc_city';
        return $vars;
    }

    public function route_to_page( $query ) {
        if ( is_admin() || ! $query->is_main_query() ) return;

        $service = $query->get( 'gc_sc_service' );
        $city    = $query->get( 'gc_sc_city' );
        if ( ! $service || ! $city ) return;

        $pages = get_posts( [
            'post_type'      => 'page',
            'post_status'    => [ 'publish', 'draft', 'private' ],
            'posts_per_page' => 1,
            'fields'         => 'ids',
            'meta_query'     => [
                'relation' => 'AND',
                [ 'key' => '_gc_service_slug', 'value' => $service, 'compare' => '=' ],
                [ 'key' => '_gc_city_slug',    'value' => $city,    'compare' => '=' ],
            ],
        ] );

        if ( empty( $pages ) ) {
            // Our query vars matched but no page exists yet. Force a clean 404
            // instead of letting WP fall through to a fuzzy random-post match.
            $query->set_404();
            status_header( 404 );
            return;
        }

        $page_id = (int) $pages[0];

        $query->set( 'page_id', $page_id );
        $query->set( 'post_type', 'page' );
        $query->is_singular = true;
        $query->is_page = true;
        $query->is_home = false;
        $query->is_404 = false;
    }

    // ---------- TEMPLATE LOADING ----------

    public function load_template( $template ) {
        if ( ! is_singular( 'page' ) ) return $template;
        if ( ! self::is_service_city_page() ) return $template;

        $custom = __DIR__ . '/_geo-templates/page-service-city.php';
        if ( file_exists( $custom ) ) return $custom;

        return $template;
    }

    // ---------- HELPER ----------

    public static function is_service_city_page( $post_id = null ) {
        $post_id = $post_id ?: get_the_ID();
        if ( ! $post_id ) return false;
        return (bool) ( get_post_meta( $post_id, '_gc_service_slug', true ) && get_post_meta( $post_id, '_gc_city_slug', true ) );
    }

    // ---------- SCHEMA: PAGE-SPECIFIC GENERAL CONTRACTOR ----------

    public function emit_page_schema() {
        if ( ! self::is_service_city_page() ) return;

        $post_id      = get_the_ID();
        $service_name = get_post_meta( $post_id, '_gc_service_name', true );
        $city_name    = get_post_meta( $post_id, '_gc_city_name', true );
        $price_range  = get_post_meta( $post_id, '_gc_ticket_range', true ) ?: '$$';

        if ( ! $service_name || ! $city_name ) return;

        $schema = [
            '@context'    => 'https://schema.org',
            '@type'       => 'GeneralContractor',
            '@id'         => get_permalink() . '#business',
            'name'        => 'Geo Carpentry LLC',
            'description' => sprintf(
                '%s in %s, WI by Geo Carpentry LLC. Licensed general contractor serving Northeast Wisconsin since 2014.',
                $service_name,
                $city_name
            ),
            'url'         => get_permalink(),
            'telephone'   => '+1-920-367-1272',
            'email'       => 'admin@geocarpentry.com',
            'priceRange'  => $price_range,
            'foundingDate'=> '2014',
            'address'     => [
                '@type'           => 'PostalAddress',
                'streetAddress'   => '735 E Walnut St Suite 3',
                'addressLocality' => 'Green Bay',
                'addressRegion'   => 'WI',
                'postalCode'      => '54301',
                'addressCountry'  => 'US',
            ],
            'geo'         => [
                '@type'    => 'GeoCoordinates',
                'latitude' => 44.5133,
                'longitude'=> -88.0133,
            ],
            'areaServed'  => [
                '@type'          => 'City',
                'name'           => $city_name,
                'addressRegion'  => 'WI',
                'addressCountry' => 'US',
            ],
            'openingHoursSpecification' => [
                [
                    '@type'     => 'OpeningHoursSpecification',
                    'dayOfWeek' => [ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday' ],
                    'opens'     => '08:00',
                    'closes'    => '18:00',
                ],
                [
                    '@type'     => 'OpeningHoursSpecification',
                    'dayOfWeek' => 'Saturday',
                    'opens'     => '09:00',
                    'closes'    => '15:00',
                ],
            ],
            'sameAs'      => [
                'https://www.facebook.com/profile.php?id=61578160947198',
                'https://www.instagram.com/geocarpentryllc2026',
            ],
            'knowsLanguage' => [ 'en', 'es' ],
            'makesOffer'  => [
                '@type'        => 'Offer',
                'itemOffered'  => [
                    '@type'      => 'Service',
                    'name'       => sprintf( '%s in %s, WI', $service_name, $city_name ),
                    'provider'   => [ '@type' => 'GeneralContractor', 'name' => 'Geo Carpentry LLC' ],
                    'areaServed' => [ '@type' => 'City', 'name' => $city_name, 'addressRegion' => 'WI' ],
                ],
                'priceRange'   => $price_range,
                'availability' => 'https://schema.org/InStock',
            ],
        ];

        echo "\n<script type=\"application/ld+json\">" . wp_json_encode( $schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . "</script>\n";
    }

    // ---------- SCHEMA: FAQ ----------

    public function emit_faq_schema() {
        if ( ! self::is_service_city_page() ) return;

        $raw = get_post_meta( get_the_ID(), '_gc_faq_jsonld', true );
        if ( ! $raw ) return;

        $faq = json_decode( $raw, true );
        if ( ! is_array( $faq ) || empty( $faq ) ) return;

        $main_entity = [];
        foreach ( $faq as $item ) {
            if ( empty( $item['q'] ) || empty( $item['a'] ) ) continue;
            $main_entity[] = [
                '@type'          => 'Question',
                'name'           => $item['q'],
                'acceptedAnswer' => [
                    '@type' => 'Answer',
                    'text'  => wp_strip_all_tags( $item['a'] ),
                ],
            ];
        }
        if ( empty( $main_entity ) ) return;

        $schema = [
            '@context'   => 'https://schema.org',
            '@type'      => 'FAQPage',
            'mainEntity' => $main_entity,
        ];

        echo "\n<script type=\"application/ld+json\">" . wp_json_encode( $schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . "</script>\n";
    }

    // ---------- SCHEMA: BREADCRUMBS ----------

    public function emit_breadcrumb_schema() {
        if ( ! self::is_service_city_page() ) return;

        $service_slug = get_post_meta( get_the_ID(), '_gc_service_slug', true );
        $city_slug    = get_post_meta( get_the_ID(), '_gc_city_slug', true );
        $service_name = get_post_meta( get_the_ID(), '_gc_service_name', true );
        $city_name    = get_post_meta( get_the_ID(), '_gc_city_name', true );
        if ( ! $service_slug || ! $city_slug ) return;

        $schema = [
            '@context'        => 'https://schema.org',
            '@type'           => 'BreadcrumbList',
            'itemListElement' => [
                [ '@type' => 'ListItem', 'position' => 1, 'name' => 'Home',     'item' => home_url( '/' ) ],
                [ '@type' => 'ListItem', 'position' => 2, 'name' => 'Services', 'item' => home_url( '/services/' ) ],
                [
                    '@type'    => 'ListItem',
                    'position' => 3,
                    'name'     => $service_name ?: ucwords( str_replace( '-', ' ', $service_slug ) ),
                    'item'     => home_url( '/services/' . $service_slug . '/' ),
                ],
                [
                    '@type'    => 'ListItem',
                    'position' => 4,
                    'name'     => ( $city_name ?: ucwords( str_replace( '-', ' ', $city_slug ) ) ) . ', WI',
                ],
            ],
        ];

        echo "\n<script type=\"application/ld+json\">" . wp_json_encode( $schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . "</script>\n";
    }
}

new Geo_Service_City_Pages();
