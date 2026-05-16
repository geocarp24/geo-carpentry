<?php
/**
 * Template Name: Custom Service Master
 * Description: High-conversion template for individual service pages.
 * Registered for Geo Carpentry LLC.
 */

if ( ! defined( 'ABSPATH' ) ) exit;

get_header();

$service_id = get_the_ID();
// Map service IDs to their corresponding hero images
$image_map = [
    2288 => 'kitchen.jpg',           // Kitchen Remodeling
    2289 => 'Azulejos.png',          // Bathroom Remodeling
    2290 => 'decks.png',             // Deck Building
    2326 => 'basement.jpg',          // Finish Carpentry & Trim (using basement as placeholder or related)
    2291 => 'full renovation.png',   // Home Renovation
    2292 => 'new construction.png',  // General Construction
];

$hero_image_name = isset($image_map[$service_id]) ? $image_map[$service_id] : 'kitchen.jpg';
$hero_image_url = get_stylesheet_directory_uri() . '/' . $hero_image_name;

// Get service info from the schema map defined in functions.php if available
$service_info = null;
if (defined('GC_SERVICE_SCHEMA_MAP')) {
    $map = GC_SERVICE_SCHEMA_MAP;
    if (isset($map[$service_id])) {
        $service_info = $map[$service_id];
    }
}
?>

<main id="primary" class="site-main gc-service-template">

    <!-- HERO SECTION -->
    <section class="gc-hero" style="background-image: url('<?php echo esc_url($hero_image_url); ?>');">
        <div class="gc-hero-inner">
            <span class="gc-hero-tag">★ Northeast Wisconsin's Trusted Contractor</span>
            <h1><?php the_title(); ?> <span class="gc-highlight">Services.</span></h1>
            <p class="gc-hero-subtitle">
                <?php
                if ($service_info) {
                    echo esc_html($service_info['description']);
                } else {
                    echo "Professional carpentry and remodeling services in Green Bay and Northeast Wisconsin. Licensed, insured, and committed to craftsmanship.";
                }
                ?>
            </p>
            <div class="gc-hero-btns">
                <a href="tel:+19203671272" class="gc-btn-primary">☎ CALL (920) 367-1272</a>
                <a href="#quote-request" class="gc-btn-secondary">Get Free Estimate</a>
            </div>
        </div>
    </section>

    <!-- MAIN CONTENT AREA -->
    <section class="gc-section gc-service-content">
        <div class="gc-container">
            <div class="gc-content-grid">
                <div class="gc-main-column">
                    <div class="entry-content">
                        <?php
                        while ( have_posts() ) :
                            the_post();
                            the_content();
                        endwhile;
                        ?>
                    </div>

                    <?php if (isset($service_info['faqs'])) : ?>
                    <div class="gc-service-faqs">
                        <h3>Frequently Asked Questions</h3>
                        <div class="gc-faq-accordion">
                            <?php foreach ($service_info['faqs'] as $faq) : ?>
                                <div class="gc-faq-item">
                                    <div class="gc-faq-question">
                                        <h4><?php echo esc_html($faq['q']); ?></h4>
                                    </div>
                                    <div class="gc-faq-answer">
                                        <p><?php echo esc_html($faq['a']); ?></p>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                    <?php endif; ?>
                </div>
                <aside class="gc-sidebar">
                    <div class="gc-sidebar-card" id="quote-request">
                        <h3>Request a Quote</h3>
                        <p>Get a free, no-obligation estimate within 24 hours.</p>
                        <?php
                        // If there's a specific form for quote requests, it would go here.
                        // For now, we use a simple call to action or the form if it was registered.
                        echo do_shortcode('[surecart_form id="2340"]');
                        ?>
                    </div>
                    <div class="gc-sidebar-info">
                        <h4>Service Details</h4>
                        <ul>
                            <li><strong>Area:</strong> Green Bay & NE Wisconsin</li>
                            <li><strong>Timeline:</strong> Varies by project</li>
                            <li><strong>Pricing:</strong> Free Estimates</li>
                            <li><strong>Languages:</strong> English & Español</li>
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    </section>

    <!-- WHY CHOOSE US -->
    <section class="gc-section gc-section-dark">
        <div class="gc-container">
            <div class="gc-why-inner">
                <div class="gc-why-content">
                    <span class="gc-section-tag">WHY CHOOSE US</span>
                    <h2>Northeast Wisconsin's Most Trusted Contractor</h2>
                    <p>For over a decade, Geo Carpentry LLC has built its reputation one project at a time — delivering quality, honesty, and craftsmanship.</p>
                    <ul class="gc-why-list">
                        <li>Licensed and fully insured in Wisconsin</li>
                        <li>Serving a 100-mile radius from Green Bay</li>
                        <li>Free estimates with no obligation</li>
                        <li>Bilingual team — English and Spanish</li>
                        <li>On-time delivery and transparent pricing</li>
                    </ul>
                </div>
                <div class="gc-why-cards">
                    <div class="gc-why-card">
                        <div class="gc-why-card-num">10+</div>
                        <div class="gc-why-card-label">YEARS IN BUSINESS</div>
                    </div>
                    <div class="gc-why-card">
                        <div class="gc-why-card-num">500+</div>
                        <div class="gc-why-card-label">HAPPY CLIENTS</div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- SERVICE AREA -->
    <section class="gc-section gc-section-light">
        <div class="gc-container">
            <div class="gc-section-header">
                <span class="gc-section-tag">SERVICE AREA</span>
                <h2>Serving All of Northeast Wisconsin</h2>
                <p>We travel up to 100 miles from Green Bay to serve homeowners and businesses.</p>
            </div>
            <div class="gc-cities-grid">
                <div class="gc-city">Green Bay</div>
                <div class="gc-city">Appleton</div>
                <div class="gc-city">Oshkosh</div>
                <div class="gc-city">Sheboygan</div>
                <div class="gc-city">Manitowoc</div>
                <div class="gc-city">Fond du Lac</div>
                <div class="gc-city">De Pere</div>
                <div class="gc-city">Howard</div>
                <div class="gc-city">Ashwaubenon</div>
                <div class="gc-city">Suamico</div>
            </div>
        </div>
    </section>

    <!-- CTA BANNER -->
    <section class="gc-cta-banner">
        <div class="gc-container">
            <h2>Ready to Start Your Project?</h2>
            <p>Get your free estimate today — response within 24 hours.</p>
            <div class="gc-cta-btns">
                <a href="tel:+19203671272" class="gc-cta-phone">☎ (920) 367-1272</a>
                <a href="https://wa.me/19209340351" class="gc-cta-whatsapp">💬 WhatsApp Us</a>
            </div>
        </div>
    </section>

</main>

<?php
get_footer();
