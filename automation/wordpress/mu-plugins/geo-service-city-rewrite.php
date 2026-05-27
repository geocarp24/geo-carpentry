<?php
/**
 * Plugin Name: Geo Carpentry — Service x City URL Rewriter
 * Description: Maps /{service}/{city}-wi/ URLs to programmatic SEO landing pages (30 city-service pages). Each page has post_type=page + custom template page-service-city.php + meta _gc_service_slug + _gc_city_slug. This plugin adds rewrite rules + query_var routing so /kitchen-remodeling/green-bay-wi/ resolves to the right page ID without needing parent pages.
 * Version: 1.0.0
 * Author: Claude Code (Bucket B3)
 * Author URI: https://geocarpentry.com
 *
 * Architecture notes:
 *   - Adds rewrite rule mapping /{service_slug}/{city_slug}-wi/ → ?gc_sc_service=X&gc_sc_city=Y
 *   - On pre_get_posts: finds the WP page matching both meta keys and rewrites the main query
 *   - On flush: rules auto-flushed when this plugin is added/removed (mu-plugins activate on load)
 *   - SaaS-correct: service + city values are dynamic, not hardcoded; reads from theme bank or env
 *
 * Created: 2026-05-27
 */

if ( ! defined( 'ABSPATH' ) ) exit;

class Geo_Service_City_Rewriter {

    /**
     * Hardcoded list — kept in sync with geo-carpentry-theme-bank.json.
     * To add a new service or city, update both this list AND the theme bank JSON.
     */
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
        add_action( 'wp_head', [ $this, 'emit_breadcrumb_schema' ], 6 );
    }

    /**
     * Register rewrite rules for all service x city combinations.
     * Pattern: /{service}/{city}-wi/  → index.php?gc_sc_service=X&gc_sc_city=Y
     */
    public function add_rewrite_rules() {
        $services = implode( '|', array_map( 'preg_quote', self::SERVICES ) );
        $cities   = implode( '|', array_map( 'preg_quote', self::CITIES ) );

        add_rewrite_rule(
            '^(' . $services . ')/(' . $cities . ')-wi/?$',
            'index.php?gc_sc_service=$matches[1]&gc_sc_city=$matches[2]',
            'top'
        );
    }

    /**
     * Register custom query vars so WP recognizes them in the URL.
     */
    public function register_query_vars( $vars ) {
        $vars[] = 'gc_sc_service';
        $vars[] = 'gc_sc_city';
        return $vars;
    }

    /**
     * On main query: if our query vars are present, find the matching page by postmeta
     * and rewrite the query to load it. 404 if no matching page exists yet.
     */
    public function route_to_page( $query ) {
        if ( is_admin() || ! $query->is_main_query() ) return;

        $service = $query->get( 'gc_sc_service' );
        $city    = $query->get( 'gc_sc_city' );
        if ( ! $service || ! $city ) return;

        // Lookup page by both meta keys
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
            // Page not yet created — let WP fall through to default 404
            return;
        }

        $page_id = (int) $pages[0];

        // Hijack the query to render this specific page
        $query->set( 'page_id', $page_id );
        $query->set( 'post_type', 'page' );
        $query->is_singular = true;
        $query->is_page = true;
        $query->is_home = false;
        $query->is_404 = false;

        // Force the custom template (in case it's not assigned in admin)
        add_filter( 'template_include', function( $tpl ) use ( $page_id ) {
            $template_meta = get_post_meta( $page_id, '_wp_page_template', true );
            if ( $template_meta === 'page-service-city.php' || ! $template_meta ) {
                $stylesheet_tpl = get_stylesheet_directory() . '/page-service-city.php';
                if ( file_exists( $stylesheet_tpl ) ) return $stylesheet_tpl;
            }
            return $tpl;
        } );
    }

    /**
     * Emit BreadcrumbList JSON-LD on service-city pages.
     * Home > Services > {Service} > {City}, WI
     */
    public function emit_breadcrumb_schema() {
        if ( ! is_singular( 'page' ) ) return;
        $service_slug = get_post_meta( get_the_ID(), '_gc_service_slug', true );
        $city_slug    = get_post_meta( get_the_ID(), '_gc_city_slug', true );
        $service_name = get_post_meta( get_the_ID(), '_gc_service_name', true );
        $city_name    = get_post_meta( get_the_ID(), '_gc_city_name', true );
        if ( ! $service_slug || ! $city_slug ) return;

        $schema = [
            '@context' => 'https://schema.org',
            '@type'    => 'BreadcrumbList',
            'itemListElement' => [
                [
                    '@type' => 'ListItem',
                    'position' => 1,
                    'name' => 'Home',
                    'item' => home_url( '/' ),
                ],
                [
                    '@type' => 'ListItem',
                    'position' => 2,
                    'name' => 'Services',
                    'item' => home_url( '/services/' ),
                ],
                [
                    '@type' => 'ListItem',
                    'position' => 3,
                    'name' => $service_name ?: ucwords( str_replace( '-', ' ', $service_slug ) ),
                    'item' => home_url( '/services/' . $service_slug . '/' ),
                ],
                [
                    '@type' => 'ListItem',
                    'position' => 4,
                    'name' => ( $city_name ?: ucwords( str_replace( '-', ' ', $city_slug ) ) ) . ', WI',
                ],
            ],
        ];

        echo "\n<script type=\"application/ld+json\">" . wp_json_encode( $schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . "</script>\n";
    }

    /**
     * Helper for other code to check if current page is a service-city landing.
     */
    public static function is_service_city_page( $post_id = null ) {
        $post_id = $post_id ?: get_the_ID();
        if ( ! $post_id ) return false;
        return (bool) ( get_post_meta( $post_id, '_gc_service_slug', true ) && get_post_meta( $post_id, '_gc_city_slug', true ) );
    }
}

new Geo_Service_City_Rewriter();

/**
 * Flush rewrite rules on plugin activation (mu-plugins reload every request,
 * but rules are cached in the database — flush once after deployment).
 *
 * To trigger manually after deployment:
 *   wp --path=/path/to/wp rewrite flush --hard
 */
