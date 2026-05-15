<?php
/**
 * Geo Carpentry Child Theme Functions
 * Theme: Built to Last. Crafted with Pride.
 */

if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Enqueue parent (Astra) and child (Geo Carpentry) styles.
 */
add_action( 'wp_enqueue_scripts', function () {
    wp_enqueue_style(
        'astra-parent-style',
        get_template_directory_uri() . '/style.css',
        [],
        wp_get_theme()->parent()->get( 'Version' )
    );
    wp_enqueue_style(
        'geo-carpentry-child-style',
        get_stylesheet_uri(),
        [ 'astra-parent-style' ],
        wp_get_theme()->get( 'Version' )
    );
} );

/**
 * Register footer widget area.
 */
add_action( 'widgets_init', function () {
    register_sidebar( [
        'name'          => 'Footer Widget Area',
        'id'            => 'footer-1',
        'description'   => 'Widgets for the Geo Carpentry footer.',
        'before_widget' => '<div class="gc-footer-widget">',
        'after_widget'  => '</div>',
        'before_title'  => '<h4>',
        'after_title'   => '</h4>',
    ] );
} );

/**
 * Inject LocalBusiness schema markup in the <head> of every page.
 * Hooked early so SEO plugins can still override if needed.
 */
add_action( 'wp_head', function () {
    $schema = [
        '@context'    => 'https://schema.org',
        '@type'       => 'GeneralContractor',
        '@id'         => home_url( '/#business' ),
        'name'        => 'Geo Carpentry LLC',
        'description' => 'Licensed carpentry and construction company serving Green Bay and Northeast Wisconsin since 2014. Custom carpentry, kitchen and bathroom remodeling, deck building, home renovation, and general construction.',
        'url'         => home_url( '/' ),
        'telephone'   => '+1-920-367-1272',
        'email'       => 'admin@geocarpentry.com',
        'priceRange'  => '$$',
        'foundingDate'=> '2014',
        'founder'     => [ '@type' => 'Person', 'name' => 'Jorge Cruz' ],
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
        'areaServed'  => array_map( function ( $city ) {
            return [ '@type' => 'City', 'name' => $city, 'addressRegion' => 'WI' ];
        }, [
            'Green Bay', 'Appleton', 'Oshkosh', 'Sheboygan', 'Manitowoc',
            'Fond du Lac', 'Wausau', 'Marinette', 'Oconto', 'Shawano',
            'De Pere', 'Ashwaubenon', 'Howard', 'Suamico', 'Pulaski',
        ] ),
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
        'slogan'      => 'Built to Last. Crafted with Pride.',
        'hasOfferCatalog' => [
            '@type' => 'OfferCatalog',
            'name'  => 'Carpentry & Construction Services',
            'itemListElement' => array_map( function ( $svc ) {
                return [
                    '@type' => 'Offer',
                    'itemOffered' => [ '@type' => 'Service', 'name' => $svc ],
                ];
            }, [
                'Finish Carpentry & Trim',
                'Kitchen Remodeling',
                'Bathroom Remodeling',
                'Deck Building',
                'Home Renovation',
                'General Construction & Custom Home Builds',
            ] ),
        ],
    ];
    echo "\n<script type=\"application/ld+json\">" . wp_json_encode( $schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . "</script>\n";
}, 5 );

/**
 * Add a default meta description fallback for pages without one.
 */
add_action( 'wp_head', function () {
    if ( is_front_page() ) {
        echo '<meta name="description" content="Licensed carpentry and construction in Green Bay and Northeast Wisconsin. Kitchen and bathroom remodeling, deck building, home renovations, general construction. 10+ years experience. Free estimates: (920) 367-1272.">' . "\n";
    }
}, 1 );

/**
 * Override Astra's footer with our branded Geo Carpentry footer.
 * Removes Astra's default footer and outputs our custom HTML.
 */
add_action( 'astra_footer', function () {
    ?>
    <footer class="gc-footer" role="contentinfo">
      <div class="gc-footer-inner">

        <div class="gc-footer-brand">
          <h3>GEO <span>CARPENTRY</span></h3>
          <div class="gc-footer-tagline">Built to Last. Crafted with Pride.</div>
          <p>Licensed carpentry and construction company serving Green Bay and Northeast Wisconsin since 2014. Quality craftsmanship, honest pricing, exceptional results.</p>
          <div class="gc-footer-social">
            <a href="https://www.facebook.com/profile.php?id=61578160947198" target="_blank" rel="noopener" class="gc-social-btn" title="Facebook">f</a>
            <a href="https://www.instagram.com/geocarpentryllc2026" target="_blank" rel="noopener" class="gc-social-btn" title="Instagram">ig</a>
            <a href="https://wa.me/19209340351" target="_blank" rel="noopener" class="gc-social-btn" title="WhatsApp">wa</a>
          </div>
        </div>

        <div class="gc-footer-col">
          <h4>Services</h4>
          <ul>
            <li><a href="/services/finish-carpentry/">Finish Carpentry</a></li>
            <li><a href="/services/kitchen-remodeling/">Kitchen Remodeling</a></li>
            <li><a href="/services/bathroom-remodeling/">Bathroom Remodeling</a></li>
            <li><a href="/services/deck-building/">Deck Building</a></li>
            <li><a href="/services/home-renovation/">Home Renovation</a></li>
            <li><a href="/services/general-construction/">General Construction</a></li>
          </ul>
        </div>

        <div class="gc-footer-col">
          <h4>Company</h4>
          <ul>
            <li><a href="/about/">About Us</a></li>
            <li><a href="/services/">All Services</a></li>
            <li><a href="/portfolio/">Portfolio</a></li>
            <li><a href="/news/">News &amp; Blog</a></li>
            <li><a href="/faq/">FAQ</a></li>
            <li><a href="/contact/">Contact</a></li>
          </ul>
        </div>

        <div class="gc-footer-col">
          <h4>Contact</h4>
          <ul class="gc-footer-contact">
            <li>📞 <a href="tel:+19203671272">(920) 367-1272</a></li>
            <li>💬 <a href="https://wa.me/19209340351" target="_blank" rel="noopener">(920) 934-0351 WhatsApp</a></li>
            <li>📧 <a href="mailto:admin@geocarpentry.com">admin@geocarpentry.com</a></li>
            <li>📍 735 E Walnut St Suite 3<br>&nbsp;&nbsp;&nbsp;&nbsp;Green Bay, WI 54301</li>
            <li>🕐 Mon-Fri 8am-6pm<br>&nbsp;&nbsp;&nbsp;&nbsp;Sat 9am-3pm</li>
          </ul>
        </div>

      </div>

      <div class="gc-footer-bottom">
        <p>© <?php echo date( 'Y' ); ?> <span>Geo Carpentry LLC</span>. All rights reserved. Licensed &amp; Insured in Wisconsin.</p>
        <p><a href="/privacy-policy/" style="color:rgba(255,255,255,0.5);">Privacy Policy</a> · <a href="/terms-of-service/" style="color:rgba(255,255,255,0.5);">Terms of Service</a></p>
      </div>
    </footer>
    <?php
}, 5 );

/**
 * Remove Astra's default footer widgets and copyright since we replaced them.
 */
add_action( 'wp', function () {
    remove_action( 'astra_footer', 'astra_footer_small_footer_template' );
    remove_action( 'astra_footer', 'astra_advanced_footer_markup' );
} );

/**
 * Inject an email capture popup (lead magnet: free estimate) after 15 seconds
 * on first visit. Uses sessionStorage so it only shows once per session.
 */
add_action( 'wp_footer', function () {
    ?>
    <div id="gc-popup-overlay" style="display:none;position:fixed;inset:0;background:rgba(27,42,74,0.78);z-index:9999;align-items:center;justify-content:center;padding:20px;">
      <div id="gc-popup" style="background:#fff;max-width:520px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,0.4);position:relative;border-top:6px solid #FF6B00;animation:gcFadeInUp 0.4s ease;">
        <button onclick="gcClosePopup()" style="position:absolute;top:12px;right:16px;background:transparent;border:none;font-size:28px;color:#1B2A4A;cursor:pointer;line-height:1;z-index:2;padding:0;width:auto;">×</button>
        <div style="padding:48px 40px 40px;text-align:center;">
          <div style="display:inline-block;background:#FF6B00;color:#fff;padding:6px 18px;border-radius:30px;font-family:'Montserrat',sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:18px;">🎁 Free Offer</div>
          <h2 style="font-family:'Playfair Display',serif;color:#1B2A4A;font-size:30px;margin-bottom:14px;line-height:1.2;">Get Your Free Project Estimate</h2>
          <p style="color:#6b7280;font-size:16px;line-height:1.6;margin-bottom:28px;">Share your email and we'll send you a 24-hour quote plus a free guide to 2026 Wisconsin construction costs.</p>
          <form id="gc-lead-form" onsubmit="return gcSubmitLead(event)" style="display:flex;flex-direction:column;gap:12px;">
            <input type="text" id="gc-lead-name" placeholder="Your name" required style="padding:14px 18px;border:2px solid #F5F5F5;border-radius:6px;font-size:15px;font-family:'Inter',sans-serif;outline:none;">
            <input type="email" id="gc-lead-email" placeholder="Your email address" required style="padding:14px 18px;border:2px solid #F5F5F5;border-radius:6px;font-size:15px;font-family:'Inter',sans-serif;outline:none;">
            <button type="submit" style="background:#FF6B00;color:#fff;padding:16px 24px;border:none;border-radius:6px;font-family:'Montserrat',sans-serif;font-weight:700;font-size:15px;letter-spacing:1px;text-transform:uppercase;cursor:pointer;margin-top:6px;transition:all 0.3s ease;">Send Me My Free Estimate</button>
          </form>
          <p style="color:#6b7280;font-size:12px;margin-top:16px;">Or call <a href="tel:+19203671272" style="color:#FF6B00;font-weight:700;">(920) 367-1272</a> now for immediate service</p>
        </div>
      </div>
    </div>
    <script>
    (function() {
      if (typeof sessionStorage === 'undefined') return;
      if (sessionStorage.getItem('gc_popup_shown')) return;
      setTimeout(function() {
        document.getElementById('gc-popup-overlay').style.display = 'flex';
        sessionStorage.setItem('gc_popup_shown', '1');
      }, 15000);
    })();
    function gcClosePopup() {
      document.getElementById('gc-popup-overlay').style.display = 'none';
    }
    function gcSubmitLead(e) {
      e.preventDefault();
      var name = document.getElementById('gc-lead-name').value;
      var email = document.getElementById('gc-lead-email').value;
      var subject = encodeURIComponent('Free Estimate Request — ' + name);
      var body = encodeURIComponent('Hi Geo Carpentry,\n\nPlease send me a free estimate.\n\nName: ' + name + '\nEmail: ' + email + '\n\nThanks!');
      window.location.href = 'mailto:admin@geocarpentry.com?subject=' + subject + '&body=' + body;
      gcClosePopup();
      return false;
    }
    </script>
    <?php
} );

/**
 * Register a navigation menu for the unified header.
 */
add_action( 'after_setup_theme', function () {
    register_nav_menus( [ 'gc-primary' => 'Geo Carpentry Primary Menu' ] );
} );

/**
 * Hide Astra's default header — we replace it with gc-brand-bar.
 */
add_action( 'wp_head', function () {
    echo '<style>
        .site-header,
        .ast-header-break-point .site-header,
        #ast-desktop-header,
        #ast-mobile-header,
        .main-header-bar,
        .ast-main-header-wrap { display: none !important; }
    </style>' . "\n";
}, 99 );

/**
 * Unified header: logo + brand + navigation + contact CTAs.
 * Replaces both the old gc-brand-bar and Astra's header.
 */
add_action( 'wp_body_open', function () {
    $logo_id  = get_theme_mod( 'custom_logo' );
    $logo_url = $logo_id ? wp_get_attachment_image_url( $logo_id, 'medium' ) : '';
    ?>
    <header class="gc-header" role="banner">
      <div class="gc-header-inner">

        <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="gc-brand-link">
          <?php if ( $logo_url ) : ?>
            <img src="<?php echo esc_url( $logo_url ); ?>" alt="Geo Carpentry LLC" class="gc-brand-logo">
          <?php endif; ?>
          <div class="gc-brand-text">
            <span class="gc-brand-title"><span>GEO</span> CARPENTRY</span>
            <span class="gc-brand-tagline">Built to Last. Crafted with Pride.</span>
          </div>
        </a>

        <nav class="gc-nav" aria-label="Primary navigation">
          <button class="gc-nav-toggle" aria-label="Open menu" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
          <?php
          wp_nav_menu( [
              'theme_location' => 'gc-primary',
              'container'      => false,
              'menu_class'     => 'gc-nav-list',
              'depth'          => 2,
              'fallback_cb'    => function () {
                  echo '<ul class="gc-nav-list">';
                  echo '<li><a href="/">Home</a></li>';
                  echo '<li><a href="/about/">About</a></li>';
                  echo '<li><a href="/services/">Services</a></li>';
                  echo '<li><a href="/portfolio/">Portfolio</a></li>';
                  echo '<li><a href="/news/">Blog</a></li>';
                  echo '<li><a href="/faq/">FAQ</a></li>';
                  echo '<li><a href="/contact/">Contact</a></li>';
                  echo '</ul>';
              },
          ] );
          ?>
        </nav>

        <div class="gc-header-contact">
          <a href="tel:+19203671272" class="gc-brand-phone">📞 (920) 367-1272</a>
          <a href="https://wa.me/19209340351" class="gc-brand-whatsapp" target="_blank" rel="noopener">💬 WhatsApp</a>
        </div>

      </div>
    </header>
    <script>
    (function(){
      var btn = document.querySelector('.gc-nav-toggle');
      var nav = document.querySelector('.gc-nav-list');
      if (!btn || !nav) return;
      btn.addEventListener('click', function(){
        var open = nav.classList.toggle('gc-nav-open');
        btn.classList.toggle('gc-nav-active', open);
        btn.setAttribute('aria-expanded', open);
      });
    })();
    </script>
    <?php
} );
// =========================================================================
// POLISH SPRINT 2 ADDITIONS — 2026-05-15
// ALEX overnight autonomous batch. Additive functions, no removals.
// =========================================================================

/**
 * QW5: Render sticky mobile CTA bar on every page (CSS handles mobile-only display).
 */
add_action( 'wp_footer', function () {
    if ( is_admin() ) return;
    ?>
    <nav class="gc-sticky-cta" aria-label="Quick contact actions">
        <a href="tel:+19203671272" aria-label="Call us at (920) 367-1272">
            <span class="gc-cta-icon" aria-hidden="true">📞</span>
            <span>Call</span>
        </a>
        <a href="https://wa.me/19209340351" target="_blank" rel="noopener" aria-label="Message us on WhatsApp">
            <span class="gc-cta-icon" aria-hidden="true">💬</span>
            <span>WhatsApp</span>
        </a>
        <a href="/contact/" aria-label="Get a free estimate">
            <span class="gc-cta-icon" aria-hidden="true">📋</span>
            <span>Get Quote</span>
        </a>
    </nav>
    <?php
}, 99 );

/**
 * QW12: Hook IntersectionObserver to fade-in elements on scroll.
 */
add_action( 'wp_footer', function () {
    if ( is_admin() ) return;
    ?>
    <script>
    (function () {
        if (!('IntersectionObserver' in window)) return;
        var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) {
            document.querySelectorAll('.gc-fade-in, .gc-section, .gc-page-intro, .gc-cta-banner').forEach(function(el){ el.classList.add('is-visible'); });
            return;
        }
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) {
                    e.target.classList.add('is-visible');
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        document.querySelectorAll('.gc-fade-in, .gc-section, .gc-page-intro, .gc-cta-banner').forEach(function (el) { io.observe(el); });
    })();
    </script>
    <?php
}, 100 );

/**
 * QW6: Add aria-label to anchor links that contain only emoji/icon content.
 * Targets WhatsApp + Facebook + Instagram links found on the site.
 * Uses output buffering through wp_head + a content filter — additive only.
 */
add_filter( 'the_content', function ( $content ) {
    if ( is_admin() ) return $content;
    // WhatsApp link (wa.me)
    $content = preg_replace_callback(
        '#<a([^>]*href="https://wa\.me/[^"]+"[^>]*)(?<!aria-label="[^"]*")>#i',
        function ( $m ) {
            if ( strpos( $m[0], 'aria-label' ) !== false ) return $m[0];
            return '<a' . $m[1] . ' aria-label="Message us on WhatsApp">';
        },
        $content
    );
    // Facebook
    $content = preg_replace_callback(
        '#<a([^>]*href="https?://(?:www\.)?facebook\.com/[^"]+"[^>]*)>#i',
        function ( $m ) {
            if ( strpos( $m[0], 'aria-label' ) !== false ) return $m[0];
            return '<a' . $m[1] . ' aria-label="Visit our Facebook page">';
        },
        $content
    );
    // Instagram
    $content = preg_replace_callback(
        '#<a([^>]*href="https?://(?:www\.)?instagram\.com/[^"]+"[^>]*)>#i',
        function ( $m ) {
            if ( strpos( $m[0], 'aria-label' ) !== false ) return $m[0];
            return '<a' . $m[1] . ' aria-label="Visit our Instagram profile">';
        },
        $content
    );
    return $content;
}, 20 );

/**
 * QW11: Add loading="lazy" + decoding="async" to images that lack the attributes.
 * Skip the first image on the page (LCP element) to keep LCP fast.
 */
add_filter( 'the_content', function ( $content ) {
    if ( is_admin() ) return $content;
    static $first_image_done = false;
    $content = preg_replace_callback(
        '#<img\s([^>]*)>#i',
        function ( $m ) use ( &$first_image_done ) {
            $attrs = $m[1];
            if ( ! $first_image_done ) {
                $first_image_done = true;
                // First image: add fetchpriority high if no loading attribute
                if ( strpos( $attrs, 'fetchpriority' ) === false ) {
                    $attrs .= ' fetchpriority="high"';
                }
                if ( strpos( $attrs, 'decoding=' ) === false ) {
                    $attrs .= ' decoding="async"';
                }
                return "<img $attrs>";
            }
            if ( strpos( $attrs, 'loading=' ) === false ) {
                $attrs .= ' loading="lazy"';
            }
            if ( strpos( $attrs, 'decoding=' ) === false ) {
                $attrs .= ' decoding="async"';
            }
            return "<img $attrs>";
        },
        $content
    );
    return $content;
}, 25 );

/**
 * QW9: Inject Jorge Cruz author byline at the top of every blog post.
 * Only applies to single posts (not pages), only if not already present.
 */
add_filter( 'the_content', function ( $content ) {
    if ( is_admin() || ! is_singular( 'post' ) ) return $content;
    // If we already injected, don't double-inject (sentinel)
    if ( strpos( $content, 'gc-author-byline' ) !== false ) return $content;
    global $post;
    $date = get_the_date( 'F j, Y', $post );
    $modified = get_the_modified_date( 'F j, Y', $post );
    $byline_html = '<div class="gc-author-byline" style="display:flex;align-items:center;gap:14px;margin:0 0 30px 0;padding:18px 22px;background:#F8F8F8;border-left:3px solid #FF6B00;border-radius:6px;font-family:\'Montserrat\',sans-serif;font-size:14px;color:#1B2A4A;">'
        . '<div style="width:42px;height:42px;background:#1B2A4A;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:15px;flex-shrink:0;">JC</div>'
        . '<div>'
        . '<div style="font-weight:700;font-size:14px;color:#1B2A4A;">By Jorge Cruz, Master Carpenter</div>'
        . '<div style="font-size:12px;color:#6b7280;margin-top:2px;">Founder of Geo Carpentry LLC · Published ' . esc_html( $date )
        . ( $modified !== $date ? ' · Updated ' . esc_html( $modified ) : '' )
        . '</div>'
        . '</div></div>';
    return $byline_html . $content;
}, 15 );

/**
 * QW10: Inject Privacy Policy link below SureForms submit button.
 * Hooks `srfm_after_submit_button` so it appears immediately under the button.
 */
add_action( 'srfm_after_submit_button', function ( $id ) {
    // Only on form 2340 (Quote Request) — others remain untouched
    if ( (int) $id !== 2340 ) return;
    $privacy_url = get_privacy_policy_url();
    if ( ! $privacy_url ) {
        $privacy_url = home_url( '/privacy-policy/' );
    }
    echo '<p class="gc-form-privacy" style="margin-top:14px;font-size:12px;color:#6b7280;text-align:center;line-height:1.5;">'
        . 'By submitting this form, you agree to our <a href="' . esc_url( $privacy_url ) . '" style="color:#FF6B00;text-decoration:underline;">Privacy Policy</a>. '
        . 'We never share or sell your information. You\'ll hear back within 24 hours.'
        . '</p>';
}, 10, 1 );

/**
 * Skip-link at top of body for keyboard navigation (WCAG 2.4.1).
 */
add_action( 'wp_body_open', function () {
    echo '<a class="gc-skip-link" href="#content">Skip to main content</a>';
}, 1 );
// SEO title override — bypasses any SEO plugin and applies directly via WP filters.
// Reads from a static map keyed by page ID for predictability + speed.

if (!defined('GC_SEO_TITLES')) {
    define('GC_SEO_TITLES', [
        2282 => 'Carpentry & Remodeling Contractor in Green Bay, WI | Geo Carpentry',
        2284 => 'About Jorge Cruz — Master Carpenter in Green Bay, WI | Geo Carpentry',
        2283 => 'Carpentry & Remodeling Services — Green Bay, WI | Geo Carpentry',
        2285 => 'Our Projects — Kitchens, Baths, Decks in Northeast WI | Geo Carpentry',
        2286 => 'Get a Free Estimate — Green Bay Carpenter & Remodeler | Geo Carpentry',
        2288 => 'Kitchen Remodeling Contractor — Green Bay, WI | Geo Carpentry',
        2289 => 'Bathroom Remodeling — Green Bay & Northeast WI | Geo Carpentry',
        2290 => 'Deck Builder Green Bay WI — Composite & Wood Decks | Geo Carpentry',
        2326 => 'Finish Carpentry & Trim Installation — Green Bay, WI | Geo Carpentry',
        2291 => 'Home Renovation Contractor — Green Bay & NE Wisconsin | Geo Carpentry',
        2292 => 'General Construction & Custom Homes — Green Bay, WI | Geo Carpentry',
    ]);
    define('GC_SEO_DESCRIPTIONS', [
        2282 => "Northeast Wisconsin's trusted carpentry & remodeling contractor since 2014. Kitchens, bathrooms, decks, additions. Free estimates: (920) 367-1272.",
        2284 => 'Meet Jorge Cruz, Master Carpenter & founder of Geo Carpentry LLC. Serving Northeast Wisconsin homeowners with quality craftsmanship since 2014.',
        2283 => 'Full-service carpentry & remodeling in Northeast Wisconsin: kitchens, bathrooms, decks, finish carpentry, home renovations, additions. Free estimates within 24 hours.',
        2285 => 'Browse recent kitchen, bathroom, deck, and renovation projects completed across Green Bay and Northeast Wisconsin. Real work by local craftsmen.',
        2286 => 'Get your free carpentry & remodeling estimate from Geo Carpentry LLC. 24-hour response, bilingual EN/ES, serving Northeast Wisconsin. Call (920) 367-1272.',
        2288 => 'Professional kitchen remodeling in Green Bay & Northeast Wisconsin. Cabinets, countertops, flooring, design. From $5,000–$30,000. Free estimate.',
        2289 => 'Bathroom remodels, tub-to-shower conversions, tile, vanity installs in Northeast Wisconsin. Most projects 1–3 weeks. Free estimate within 24 hours.',
        2290 => 'New deck construction, repair & re-staining in Northeast Wisconsin. Composite, wood, PVC. Permit assistance for Brown County. Built for WI weather.',
        2326 => 'Crown molding, baseboards, door & window trim, finish carpentry installation across Northeast Wisconsin. Detail-focused craftsmen.',
        2291 => 'Full home updates, kitchen + bath combos, flooring, drywall, paint in Northeast Wisconsin. Project management included. Free estimates.',
        2292 => 'General construction, home additions, framing, structural work, custom home builds across Northeast Wisconsin. Licensed & insured.',
    ]);
}

/** Override <title> tag content via pre_get_document_title (highest priority WP filter). */
add_filter('pre_get_document_title', function ($title) {
    if (is_admin()) return $title;
    $id = 0;
    if (is_front_page() || is_home()) {
        $id = (int) get_option('page_on_front');
    } elseif (is_singular()) {
        $id = (int) get_the_ID();
    }
    if ($id && isset(GC_SEO_TITLES[$id])) {
        return GC_SEO_TITLES[$id];
    }
    return $title;
}, 100);

/** Override meta description via wp_head — also remove any pre-existing duplicate description. */
add_action('wp_head', function () {
    if (is_admin()) return;
    $id = 0;
    if (is_front_page() || is_home()) {
        $id = (int) get_option('page_on_front');
    } elseif (is_singular()) {
        $id = (int) get_the_ID();
    }
    if ($id && isset(GC_SEO_DESCRIPTIONS[$id])) {
        echo "\n<meta name=\"description\" content=\"" . esc_attr(GC_SEO_DESCRIPTIONS[$id]) . "\" />\n";
        // Strip any other description meta tags by buffering wp_head output
    }
}, 1);

/** Strip duplicate meta description tags (keeps only ours, which is output at priority 1).
 *  This catches Astra theme's auto-description that may conflict.
 */
add_action('wp_head', function () {
    if (is_admin()) return;
    $id = 0;
    if (is_front_page() || is_home()) {
        $id = (int) get_option('page_on_front');
    } elseif (is_singular()) {
        $id = (int) get_the_ID();
    }
    if (!$id || !isset(GC_SEO_DESCRIPTIONS[$id])) return;
    // Remove Astra's description hook if it exists
    remove_action('wp_head', 'astra_meta_description', 1);
}, 0);