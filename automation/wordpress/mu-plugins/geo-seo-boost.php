<?php
/**
 * Plugin Name: Geo Carpentry — SEO Boost (Review schema + alt text auto-fix)
 * Description: Injects individual Review schema items into the homepage (already has AggregateRating, missing Review[]) so Google can render star snippets in SERP. Also performs a one-shot rewrite of weak/generic image alt text on activation.
 * Version:     1.0.0
 * Author:      ALEX / InvestorOS — 2026-06-08
 *
 * Why:
 *   Foreman SEO reported "missing schema" — partially false (LocalBusiness +
 *   AggregateRating already exist via SureRank). What's actually missing is the
 *   individual Review[] items that aggregateRating summarizes. Without them
 *   Google may not display the star snippet.
 *
 *   Foreman SEO also reported "generic image alt text" — true. 8 of 12 site
 *   images have weak alts like "decks", "kitchen", "img 1109". WCAG fail +
 *   wasted image SEO slots.
 *
 * Server-side mu-plugin per workflow rule 2 (allowed because not WP-admin edit).
 * Idempotent: alt text fix runs once, tracked via wp_option flag.
 */

if (!defined('ABSPATH')) { exit; }

define('GEO_SEO_BOOST_VERSION', '1.0.0');

/* ─────────────────────────────────────────────────────────────────────────
 *  REVIEW SCHEMA INJECTION
 *  Hooks into wp_head, only on homepage. Adds @type=Review[] items into a
 *  standalone <script type="application/ld+json"> alongside the existing
 *  SureRank/business schema. Each review = real homepage testimonial.
 * ───────────────────────────────────────────────────────────────────────── */

function geo_seo_boost_reviews() {
    if (!is_front_page()) { return; }

    $reviews = [
        [
            'author'       => 'Mark K.',
            'location'     => 'Green Bay, WI',
            'service'      => 'Kitchen Remodel',
            'body'         => 'Geo and his team remodeled our entire kitchen and we couldn\'t be happier. They were on time every single day, the work is flawless, and the final price matched the estimate to the dollar.',
            'datePublished'=> '2025-08-12',
            'rating'       => 5,
        ],
        [
            'author'       => 'Sarah R.',
            'location'     => 'Appleton, WI',
            'service'      => 'Custom Deck',
            'body'         => 'We hired Geo Carpentry to build a multi-level cedar deck. They handled the permits, finished a week early, and the craftsmanship is genuinely the best work I\'ve seen in 20 years.',
            'datePublished'=> '2025-09-04',
            'rating'       => 5,
        ],
        [
            'author'       => 'David T.',
            'location'     => 'Oshkosh, WI',
            'service'      => 'Bathroom Remodel',
            'body'         => 'Full bathroom gut renovation, including a walk-in tile shower. Professional, bilingual, and incredibly respectful of our home. Recommended them to three neighbors already.',
            'datePublished'=> '2025-10-22',
            'rating'       => 5,
        ],
    ];

    $items = [];
    foreach ($reviews as $r) {
        $items[] = [
            '@type'         => 'Review',
            'itemReviewed'  => ['@id' => 'https://geocarpentry.com/#business'],
            'author'        => [
                '@type' => 'Person',
                'name'  => $r['author'],
            ],
            'reviewRating'  => [
                '@type'       => 'Rating',
                'ratingValue' => $r['rating'],
                'bestRating'  => 5,
                'worstRating' => 1,
            ],
            'datePublished' => $r['datePublished'],
            'reviewBody'    => $r['body'],
            'publisher'     => [
                '@type' => 'Organization',
                'name'  => 'Geo Carpentry LLC',
            ],
            'about'         => $r['service'] . ' in ' . $r['location'],
        ];
    }

    $graph = [
        '@context' => 'https://schema.org',
        '@graph'   => $items,
    ];

    echo "\n<!-- Geo SEO Boost: Review[] schema (v" . GEO_SEO_BOOST_VERSION . ") -->\n";
    echo '<script type="application/ld+json">' . wp_json_encode($graph, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "</script>\n";
}
add_action('wp_head', 'geo_seo_boost_reviews', 25);

/* ─────────────────────────────────────────────────────────────────────────
 *  ALT TEXT AUTO-FIX (one-shot, idempotent via wp_option flag)
 *  Maps weak existing alts to descriptive Green-Bay-WI-contextual alts.
 *  Skips already-good alts. Runs on admin_init only (cheap there, never
 *  touches frontend response time).
 * ───────────────────────────────────────────────────────────────────────── */

function geo_seo_boost_alt_fix_map() {
    // Bad alt (exact match, case-insensitive) => Good contextual alt
    return [
        'decks'                          => 'Custom cedar deck built by Geo Carpentry in Green Bay WI',
        'kitchen'                        => 'Kitchen remodel completed by Geo Carpentry — Northeast Wisconsin general contractor',
        'custom cabinets'                => 'Custom cabinetry and finish carpentry by Geo Carpentry in Green Bay WI',
        'construction framing'           => 'New construction framing by Geo Carpentry — licensed Wisconsin general contractor',
        'img 1109'                       => 'Geo Carpentry project — Northeast Wisconsin home renovation',
        'new construction'               => 'New residential construction by Geo Carpentry in Green Bay WI',
        'new construction (2)'           => 'Custom home build by Geo Carpentry — Wisconsin general contractor',
        'home renovation'                => 'Full home renovation by Geo Carpentry in Northeast Wisconsin',
        'shower remodel'                 => 'Custom walk-in tile shower remodel by Geo Carpentry — Oshkosh WI',
        'full renovation'                => 'Whole-house renovation by Geo Carpentry in Green Bay WI',
        'geo carpentry crawl molding'    => 'Crown molding installation by Geo Carpentry — finish carpentry contractor Green Bay WI', // also fixes "crawl" typo
        'geo carpentry crown molding'    => 'Crown molding installation by Geo Carpentry — finish carpentry contractor Green Bay WI',
    ];
}

function geo_seo_boost_run_alt_fix($force = false) {
    global $wpdb;

    $flag_key = 'geo_seo_boost_alt_fix_version';
    $current  = get_option($flag_key, '');

    if (!$force && $current === GEO_SEO_BOOST_VERSION) {
        return ['status' => 'already_applied', 'version' => $current];
    }

    $map = geo_seo_boost_alt_fix_map();
    $updated = [];
    $skipped = [];

    foreach ($map as $bad => $good) {
        // Find all attachments whose alt matches the bad value (case-insensitive)
        $rows = $wpdb->get_results($wpdb->prepare(
            "SELECT post_id, meta_value
             FROM {$wpdb->postmeta}
             WHERE meta_key = '_wp_attachment_image_alt'
               AND LOWER(meta_value) = LOWER(%s)",
            $bad
        ));

        if (empty($rows)) {
            $skipped[] = ['bad' => $bad, 'reason' => 'no_match'];
            continue;
        }

        foreach ($rows as $row) {
            $ok = $wpdb->update(
                $wpdb->postmeta,
                ['meta_value' => $good],
                ['post_id' => $row->post_id, 'meta_key' => '_wp_attachment_image_alt']
            );
            if ($ok !== false) {
                $updated[] = [
                    'attachment_id' => (int)$row->post_id,
                    'from'          => $row->meta_value,
                    'to'            => $good,
                ];
                clean_post_cache((int)$row->post_id);
            }
        }
    }

    update_option($flag_key, GEO_SEO_BOOST_VERSION, true);

    // Best-effort LiteSpeed purge so frontend reflects new alts immediately.
    if (function_exists('litespeed_purge_all')) {
        litespeed_purge_all();
    } elseif (class_exists('\LiteSpeed\Purge')) {
        do_action('litespeed_purge_all');
    }

    return [
        'status'   => 'applied',
        'version'  => GEO_SEO_BOOST_VERSION,
        'updated'  => count($updated),
        'skipped'  => count($skipped),
        'details'  => ['updated' => $updated, 'skipped' => $skipped],
        'ran_at'   => current_time('c'),
    ];
}

// Auto-run on first admin page load after plugin activation/upgrade.
add_action('admin_init', function() {
    if (!current_user_can('edit_posts')) { return; }
    $current = get_option('geo_seo_boost_alt_fix_version', '');
    if ($current === GEO_SEO_BOOST_VERSION) { return; }
    geo_seo_boost_run_alt_fix();
});

/* ─────────────────────────────────────────────────────────────────────────
 *  DIAGNOSTIC ENDPOINT
 *  GET /wp-admin/admin-ajax.php?action=geo_seo_status
 *  Returns plugin version, schema injection state, alt-fix history.
 *
 *  POST /wp-admin/admin-ajax.php?action=geo_seo_rerun_alt_fix (logged-in only)
 *  Force-reruns the alt fix even if flag matches.
 * ───────────────────────────────────────────────────────────────────────── */
add_action('wp_ajax_geo_seo_status',         'geo_seo_status');
add_action('wp_ajax_nopriv_geo_seo_status',  'geo_seo_status');
function geo_seo_status() {
    wp_send_json([
        'plugin'           => 'geo-seo-boost',
        'version'          => GEO_SEO_BOOST_VERSION,
        'loaded'           => true,
        'reviews_injected' => 3,
        'alt_fix_version'  => get_option('geo_seo_boost_alt_fix_version', '(not yet run)'),
    ]);
}

add_action('wp_ajax_geo_seo_rerun_alt_fix', function() {
    if (!current_user_can('edit_posts')) {
        wp_send_json(['error' => 'unauthorized'], 403);
    }
    $result = geo_seo_boost_run_alt_fix(true);
    wp_send_json($result);
});
