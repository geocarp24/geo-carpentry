<?php
/**
 * Template Name: Service x City Landing
 *
 * Programmatic SEO template for /{service}/{city}-wi/ pages.
 * Renders pages created by the Content_Queue bulk creator (Claude Code Bucket B5).
 *
 * Reads from postmeta:
 *   - _gc_service_slug    (e.g. "kitchen-remodeling")
 *   - _gc_service_name    (e.g. "Kitchen Remodeling")
 *   - _gc_city_slug       (e.g. "green-bay")
 *   - _gc_city_name       (e.g. "Green Bay")
 *   - _gc_county          (e.g. "Brown")
 *   - _gc_phone           (e.g. "+19203671272")
 *   - _gc_ticket_range    (e.g. "$5,000 – $30,000")
 *   - _gc_hero_image_id   (attachment ID for hero)
 *   - _gc_target_keyword  (used in body but not displayed)
 *   - _gc_faq_jsonld      (array of {q, a} for FAQ schema; rendered as <details>)
 *   - _gc_internal_links  (JSON array of {url, anchor})
 *   - _gc_cta_primary     (e.g. "Get My Free Kitchen Estimate in Green Bay")
 *
 * Body content lives in post_content (HTML rendered from body_md by bulk script).
 * Schema injection happens in functions.php via is_service_city_page() check.
 *
 * Author: Claude Code (Bucket B2)
 * Created: 2026-05-27
 */

if ( ! defined( 'ABSPATH' ) ) exit;

get_header();

$service_name = get_post_meta( get_the_ID(), '_gc_service_name', true );
$city_name    = get_post_meta( get_the_ID(), '_gc_city_name', true );
$phone        = get_post_meta( get_the_ID(), '_gc_phone', true ) ?: '+19203671272';
$ticket_range = get_post_meta( get_the_ID(), '_gc_ticket_range', true );
$hero_id      = (int) get_post_meta( get_the_ID(), '_gc_hero_image_id', true );
$cta_primary  = get_post_meta( get_the_ID(), '_gc_cta_primary', true ) ?: 'Get My Free Estimate';
$faq_raw      = get_post_meta( get_the_ID(), '_gc_faq_jsonld', true );
$faq          = $faq_raw ? json_decode( $faq_raw, true ) : [];
$links_raw    = get_post_meta( get_the_ID(), '_gc_internal_links', true );
$links        = $links_raw ? json_decode( $links_raw, true ) : [];

$hero_url = $hero_id ? wp_get_attachment_image_url( $hero_id, 'large' ) : '';
$phone_display = preg_replace( '/(\d{3})(\d{3})(\d{4})/', '($1) $2-$3', preg_replace( '/[^\d]/', '', $phone ) );
?>

<main class="gc-service-city" role="main">
	<!-- Hero -->
	<section class="gc-sc-hero" style="<?php echo $hero_url ? 'background-image:linear-gradient(rgba(27,42,74,0.65),rgba(27,42,74,0.85)),url(' . esc_url( $hero_url ) . ');' : ''; ?>">
		<div class="gc-sc-hero__inner">
			<p class="gc-sc-eyebrow">GEO CARPENTRY LLC · LICENSED GENERAL CONTRACTOR</p>
			<h1 class="gc-sc-h1"><?php the_title(); ?></h1>
			<?php if ( $ticket_range ) : ?>
				<p class="gc-sc-subtitle">Typical project range: <strong><?php echo esc_html( $ticket_range ); ?></strong> · Free estimate within 24 hours</p>
			<?php endif; ?>
			<div class="gc-sc-hero-cta">
				<a href="/quote/" class="gc-btn gc-btn--primary"><?php echo esc_html( $cta_primary ); ?></a>
				<a href="tel:<?php echo esc_attr( $phone ); ?>" class="gc-btn gc-btn--outline">Call <?php echo esc_html( $phone_display ); ?></a>
			</div>
		</div>
	</section>

	<!-- Trust strip -->
	<section class="gc-sc-trust">
		<div class="gc-sc-trust__inner">
			<div class="gc-sc-trust__item"><strong>12+ years</strong><span>Northeast Wisconsin</span></div>
			<div class="gc-sc-trust__item"><strong>Licensed &amp; insured</strong><span>Wisconsin general contractor</span></div>
			<div class="gc-sc-trust__item"><strong>Bilingual EN / ES</strong><span>Comunicación en tu idioma</span></div>
			<div class="gc-sc-trust__item"><strong>24-hour estimate</strong><span>Quote in your inbox tomorrow</span></div>
		</div>
	</section>

	<!-- Body (HTML from post_content, rendered from body_md by bulk script) -->
	<section class="gc-sc-body">
		<div class="gc-sc-body__inner">
			<?php while ( have_posts() ) : the_post(); the_content(); endwhile; ?>
		</div>
	</section>

	<!-- FAQ (if FAQ data present in postmeta) -->
	<?php if ( ! empty( $faq ) && is_array( $faq ) ) : ?>
		<section class="gc-sc-faq">
			<div class="gc-sc-faq__inner">
				<h2>Frequently Asked Questions: <?php echo esc_html( $service_name ); ?> in <?php echo esc_html( $city_name ); ?></h2>
				<?php foreach ( $faq as $item ) : ?>
					<details class="gc-sc-faq__item">
						<summary><?php echo esc_html( $item['q'] ?? '' ); ?></summary>
						<div class="gc-sc-faq__answer"><?php echo wp_kses_post( $item['a'] ?? '' ); ?></div>
					</details>
				<?php endforeach; ?>
			</div>
		</section>
	<?php endif; ?>

	<!-- Internal links (cross-city + cross-service navigation) -->
	<?php if ( ! empty( $links ) && is_array( $links ) ) : ?>
		<section class="gc-sc-related">
			<div class="gc-sc-related__inner">
				<h2>Related Services Across Northeast Wisconsin</h2>
				<ul class="gc-sc-related__list">
					<?php foreach ( $links as $link ) : ?>
						<li><a href="<?php echo esc_url( $link['url'] ?? '#' ); ?>"><?php echo esc_html( $link['anchor'] ?? '' ); ?></a></li>
					<?php endforeach; ?>
				</ul>
			</div>
		</section>
	<?php endif; ?>

	<!-- Final CTA -->
	<section class="gc-sc-final-cta">
		<div class="gc-sc-final-cta__inner">
			<h2>Ready to start your <?php echo esc_html( strtolower( $service_name ) ); ?> project in <?php echo esc_html( $city_name ); ?>?</h2>
			<p>We respond to every estimate request within 24 hours. No high-pressure sales — just a clear, written quote.</p>
			<div class="gc-sc-final-cta__buttons">
				<a href="/quote/" class="gc-btn gc-btn--primary gc-btn--lg"><?php echo esc_html( $cta_primary ); ?></a>
				<a href="tel:<?php echo esc_attr( $phone ); ?>" class="gc-btn gc-btn--outline gc-btn--lg">Call <?php echo esc_html( $phone_display ); ?></a>
			</div>
		</div>
	</section>
</main>

<?php
get_footer();
