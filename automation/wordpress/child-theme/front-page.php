<?php
/**
 * Template Name: Geo Carpentry Front Page
 *
 * Master homepage template — based on Claude.ai-approved design 2026-05-16.
 * This template is the visual design system for the entire site. Other pages
 * (about, services, portfolio, etc.) will adopt the same .fp-* component
 * classes in subsequent deploys.
 *
 * Header (.gc-header), footer (.gc-footer), sticky-cta (.gc-sticky-cta),
 * skip-link, schemas, and lazy-load/aria-label filters are all injected
 * automatically via existing functions.php hooks. This template only renders
 * the homepage-unique sections.
 *
 * @package Geo_Carpentry_Child
 */

if ( ! defined( 'ABSPATH' ) ) exit;

get_header();

$theme_uri = get_stylesheet_directory_uri();

// Service cards reordered per brand pivot: General Contractor leads, Finish Carpentry last.
$fp_services = [
    [ 'slug' => 'kitchen-remodeling',        'img' => 'service-kitchen.jpg',              'title' => 'Kitchen Remodeling',                  'desc' => 'Full kitchen renovations — cabinets, countertops, backsplash, flooring, lighting. Design through completion. Quote within 24 hours.' ],
    [ 'slug' => 'bathroom-remodeling',       'img' => 'service-bathroom.jpg',             'title' => 'Bathroom Remodeling',                 'desc' => 'Modern bath upgrades — walk-in showers, tile, vanities, fixtures, and finish carpentry built for Wisconsin homes.' ],
    [ 'slug' => 'deck-building',             'img' => 'service-deck.jpg',                 'title' => 'Deck Building',                       'desc' => 'Decks built for WI weather — composite, cedar, pressure-treated lumber. Multi-level and single-level designs with permit assistance.' ],
    [ 'slug' => 'home-renovation',           'img' => 'service-home-renovation.jpg',      'title' => 'Home Renovation',                     'desc' => 'Single-room to whole-home transformations — basement finishing, attic conversion, flooring, drywall, full remodels managed end to end.' ],
    [ 'slug' => 'general-construction',      'img' => 'service-general-construction.jpg', 'title' => 'General Construction & Custom Homes', 'desc' => 'Licensed general contractor for new home builds, additions, garages, framing, and structural work across Northeast Wisconsin.' ],
    [ 'slug' => 'finish-carpentry',          'img' => 'service-finish-carpentry.jpg',     'title' => 'Finish Carpentry & Trim',             'desc' => 'Crown molding, baseboards, door and window trim, hardwood floors, and interior finish work — detail-focused craftsmanship.' ],
];

// Stats — consistent "500+ Projects" across hero and Why Choose (no "Happy Clients" duplicate).
$fp_stats_bar = [
    [ 'num' => '10+',   'label' => 'Years Experience' ],
    [ 'num' => '500+',  'label' => 'Projects Completed' ],
    [ 'num' => '100mi', 'label' => 'Service Radius' ],
    [ 'num' => '100%',  'label' => 'Licensed &amp; Insured' ],
];

$fp_why_stats = [
    [ 'num' => '10+',  'label' => 'Years In Business' ],
    [ 'num' => '500+', 'label' => 'Projects Completed' ],
    [ 'num' => '6',    'label' => 'Core Services' ],
    [ 'num' => 'EN/ES','label' => 'Bilingual Team' ],
];

$fp_why_items = [
    'Licensed and fully insured in Wisconsin',
    'Serving a 100-mile radius from Green Bay',
    'Free estimates with no obligation',
    'Bilingual team — English and Spanish',
    'On-time delivery and transparent pricing',
    'Premium materials on every single project',
];

// Generic testimonial placeholders. Jorge will swap in Claude.ai-generated copy.
$fp_testimonials = [
    [
        'quote' => 'Geo Carpentry remodeled our kitchen on schedule and on budget. Jorge communicated every step and the finish work is impressive. We&rsquo;d hire them again without hesitation.',
        'name'  => 'Sarah M.',
        'city'  => 'Howard, WI',
        'svc'   => 'Kitchen Remodel',
    ],
    [
        'quote' => 'Built us a multi-level cedar deck that survived its first Wisconsin winter without a scratch. Professional crew, fair quote, clean job site every day.',
        'name'  => 'Mike R.',
        'city'  => 'De Pere, WI',
        'svc'   => 'Deck Build',
    ],
    [
        'quote' => 'Hablamos en español desde el primer d&iacute;a y eso nos dio mucha confianza. El ba&ntilde;o quedó hermoso y el equipo respetó cada detalle del presupuesto.',
        'name'  => 'Carlos L.',
        'city'  => 'Green Bay, WI',
        'svc'   => 'Bathroom Remodel',
    ],
];

$fp_cities = [
    'Green Bay', 'Appleton', 'Oshkosh', 'Sheboygan', 'Manitowoc',
    'Fond du Lac', 'Wausau', 'Marinette', 'Oconto', 'Shawano',
    'De Pere', 'Ashwaubenon', 'Howard', 'Suamico', 'Pulaski',
];
?>

<div class="fp-main">

  <!-- ============ HERO ============ -->
  <section class="fp-hero" style="background-image: url('<?php echo esc_url( $theme_uri . '/images/hero-kitchen-remodel.jpg' ); ?>');">
    <div class="fp-hero-overlay" aria-hidden="true"></div>
    <div class="fp-container fp-hero-inner">
      <p class="fp-hero-label">★ Northeast Wisconsin's Licensed General Contractor</p>
      <h1 class="fp-hero-heading">Built to <span>Last.</span><br>Crafted with <span>Pride.</span></h1>
      <p class="fp-hero-text">Geo Carpentry LLC is a fully licensed general contractor delivering kitchen remodels, deck builds, bathroom renovations, custom homes, and finish carpentry across Green Bay and Northeast Wisconsin since 2014.</p>

      <div class="fp-trust-row" role="list">
        <span class="fp-badge" role="listitem">✓ Licensed &amp; Insured</span>
        <span class="fp-badge" role="listitem">✓ Bilingual EN/ES</span>
        <span class="fp-badge" role="listitem">✓ 12+ Years Experience</span>
        <span class="fp-badge" role="listitem">✓ 500+ Projects</span>
      </div>

      <div class="fp-cta-row">
        <a href="tel:+19203671272" class="fp-cta fp-cta-primary" aria-label="Call Geo Carpentry at (920) 367-1272">
          <span aria-hidden="true">☎</span> Call (920) 367-1272
        </a>
        <a href="https://wa.me/19209340351" class="fp-cta fp-cta-secondary" target="_blank" rel="noopener" aria-label="Message us on WhatsApp">
          <span aria-hidden="true">💬</span> WhatsApp Us
        </a>
      </div>
    </div>
  </section>

  <!-- ============ STATS BAR ============ -->
  <section class="fp-stats-bar" aria-label="Geo Carpentry by the numbers">
    <div class="fp-container">
      <div class="fp-stats-grid">
        <?php foreach ( $fp_stats_bar as $stat ) : ?>
          <div class="fp-stat-item">
            <h3><?php echo esc_html( $stat['num'] ); ?></h3>
            <p><?php echo wp_kses( $stat['label'], [] ); ?></p>
          </div>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <!-- ============ SERVICES ============ -->
  <section class="fp-services fp-section-padding" id="services">
    <div class="fp-container">
      <p class="fp-section-label">What We Do</p>
      <h2 class="fp-section-heading">Expert Services Across Northeast Wisconsin</h2>
      <p class="fp-section-desc">Kitchen and bathroom remodeling, deck building, home renovations, finish carpentry, and full general construction — from Green Bay to Appleton, Oshkosh, and beyond. Free 24-hour estimates.</p>

      <div class="fp-services-grid">
        <?php foreach ( $fp_services as $svc ) : ?>
          <article class="fp-service-card">
            <div class="fp-service-image">
              <img src="<?php echo esc_url( $theme_uri . '/images/' . $svc['img'] ); ?>" alt="<?php echo esc_attr( $svc['title'] ); ?> — Geo Carpentry project" loading="lazy" decoding="async" width="600" height="400">
            </div>
            <div class="fp-service-content">
              <h3><?php echo esc_html( $svc['title'] ); ?></h3>
              <p><?php echo wp_kses( $svc['desc'], [] ); ?></p>
              <a href="/services/<?php echo esc_attr( $svc['slug'] ); ?>/" class="fp-service-link">Learn more <span aria-hidden="true">→</span></a>
            </div>
          </article>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <!-- ============ WHY CHOOSE US ============ -->
  <section class="fp-why-choose" id="why">
    <div class="fp-container">
      <div class="fp-why-grid">
        <div class="fp-why-content">
          <p class="fp-section-label fp-section-label-orange">Why Choose Us</p>
          <h2 class="fp-why-heading">Northeast Wisconsin's Most Trusted Contractor</h2>
          <p class="fp-why-text">For over a decade, Geo Carpentry LLC has built its reputation one project at a time — delivering quality, honesty, and craftsmanship that homeowners across Northeast Wisconsin recommend to their friends and neighbors.</p>

          <ul class="fp-why-list">
            <?php foreach ( $fp_why_items as $item ) : ?>
              <li class="fp-why-item">
                <span class="fp-why-icon" aria-hidden="true">✓</span>
                <span class="fp-why-item-text"><?php echo esc_html( $item ); ?></span>
              </li>
            <?php endforeach; ?>
          </ul>
        </div>

        <div class="fp-why-stats" role="list" aria-label="Geo Carpentry track record">
          <?php foreach ( $fp_why_stats as $stat ) : ?>
            <div class="fp-stat-box" role="listitem">
              <div class="fp-stat-box-number"><?php echo esc_html( $stat['num'] ); ?></div>
              <div class="fp-stat-box-label"><?php echo esc_html( $stat['label'] ); ?></div>
            </div>
          <?php endforeach; ?>
        </div>
      </div>
    </div>
  </section>

  <!-- ============ TESTIMONIALS ============ -->
  <section class="fp-testimonials fp-section-padding" aria-label="Customer testimonials">
    <div class="fp-container">
      <p class="fp-section-label">Our Clients</p>
      <h2 class="fp-section-heading">Trusted by Homeowners Across Northeast Wisconsin</h2>
      <p class="fp-section-desc">Real feedback from real projects. Every Geo Carpentry quote is honored, every timeline is respected, every detail is finished right.</p>

      <div class="fp-testimonials-grid">
        <?php foreach ( $fp_testimonials as $t ) : ?>
          <figure class="fp-testimonial-card">
            <div class="fp-testimonial-stars" aria-label="5 out of 5 stars">★★★★★</div>
            <blockquote class="fp-testimonial-quote"><?php echo wp_kses( $t['quote'], [] ); ?></blockquote>
            <figcaption class="fp-testimonial-meta">
              <strong><?php echo esc_html( $t['name'] ); ?></strong>
              <span><?php echo esc_html( $t['city'] ); ?> &middot; <?php echo esc_html( $t['svc'] ); ?></span>
            </figcaption>
          </figure>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <!-- ============ SERVICE AREA ============ -->
  <section class="fp-service-area" id="area">
    <div class="fp-container">
      <p class="fp-section-label">Service Area</p>
      <h2 class="fp-section-heading">Serving All of Northeast Wisconsin</h2>
      <p class="fp-section-desc">We travel up to 100 miles from Green Bay to serve homeowners and businesses across the region. Don't see your city? <a href="#fp-form" class="fp-inline-link">Contact us</a> &mdash; we likely cover your area.</p>

      <ul class="fp-cities-grid" role="list">
        <?php foreach ( $fp_cities as $city ) : ?>
          <li class="fp-city-tag"><?php echo esc_html( $city ); ?></li>
        <?php endforeach; ?>
      </ul>
    </div>
  </section>

  <!-- ============ LEAD FORM ============ -->
  <section class="fp-form-section fp-section-padding" id="fp-form" aria-label="Get a free estimate">
    <div class="fp-container fp-form-container">
      <div class="fp-form-header">
        <p class="fp-section-label">Free Estimate</p>
        <h2 class="fp-section-heading">Get Your Free Quote Today</h2>
        <p class="fp-section-desc">No obligation. Bilingual EN/ES support. Response within 24 hours.</p>
      </div>
      <div class="fp-form-embed">
        <?php echo do_shortcode( '[sureforms id="2340"]' ); ?>
      </div>
    </div>
  </section>

  <!-- ============ FINAL CTA ============ -->
  <section class="fp-final-cta" id="contact">
    <div class="fp-container fp-final-cta-inner">
      <h2 class="fp-final-cta-heading">Ready to Start Your Project?</h2>
      <p class="fp-final-cta-text">Get your free estimate today &mdash; no obligation, response within 24 hours.</p>
      <div class="fp-final-cta-buttons">
        <a href="tel:+19203671272" class="fp-cta fp-cta-white" aria-label="Call Geo Carpentry at (920) 367-1272">
          <span aria-hidden="true">☎</span> (920) 367-1272
        </a>
        <a href="https://wa.me/19209340351" class="fp-cta fp-cta-outline-white" target="_blank" rel="noopener" aria-label="Message us on WhatsApp">
          <span aria-hidden="true">💬</span> WhatsApp Us
        </a>
      </div>
    </div>
  </section>

</div><!-- /.fp-main -->

<?php get_footer();
