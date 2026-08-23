<?php
/**
 * Titles, H1s and meta descriptions for the 30 service-by-city pages.
 * Every one of them shipped with an H1 of 66-75 characters that was identical
 * to the title tag, no SEO title of its own, and no meta description, so Google
 * was fabricating the snippet from body copy.
 *
 * Original post_title is stored in _geo_title_backup before overwriting.
 */

$services = [
  'kitchen-remodeling' => [
    'title' => 'Kitchen Remodeling in %s, WI | Geo Carpentry',
    'h1'    => '%s Kitchen Remodeling: Cabinets, Countertops and Full Renovations',
    'desc'  => 'Licensed kitchen remodeling contractor in %s, WI. Cabinets, countertops, flooring and full renovations. Free estimate in 24 hours. Call (920) 367-1272.',
  ],
  'bathroom-remodeling' => [
    'title' => 'Bathroom Remodeling in %s, WI | Geo Carpentry',
    'h1'    => '%s Bathroom Remodeling: Tile Showers, Vanities and Full Remodels',
    'desc'  => 'Licensed bathroom remodeling contractor in %s, WI. Tile showers, vanities, flooring and full gut remodels. Free estimate in 24 hours. Call (920) 367-1272.',
  ],
  'deck-building' => [
    'title' => 'Deck Builder in %s, WI | Geo Carpentry',
    'h1'    => '%s Deck Builder: Cedar, Composite and Multi-Level Decks',
    'desc'  => 'Licensed deck builder in %s, WI. Cedar and composite decks, multi-level builds, permits handled. Free estimate in 24 hours. Call (920) 367-1272.',
  ],
  'finish-carpentry' => [
    'title' => 'Finish Carpentry in %s, WI | Geo Carpentry',
    'h1'    => '%s Finish Carpentry: Trim, Baseboards and Interior Doors',
    'desc'  => 'Finish carpentry in %s, WI. Trim, baseboards, crown molding and interior doors by a licensed contractor. Free estimate in 24 hours. Call (920) 367-1272.',
  ],
  'home-renovation' => [
    'title' => 'Home Renovation in %s, WI | Geo Carpentry',
    'h1'    => '%s Home Renovation: Basements, Additions and Whole-House Remodels',
    'desc'  => 'Licensed home renovation contractor in %s, WI. Basement finishing, room additions and whole-house remodels. Free estimate in 24 hours. Call (920) 367-1272.',
  ],
  'general-construction' => [
    'title' => 'General Contractor in %s, WI | Geo Carpentry',
    'h1'    => '%s General Contractor for Custom Homes, Additions and Framing',
    'desc'  => 'Licensed general contractor in %s, WI. Custom homes, additions, framing and commercial construction. Free estimate in 24 hours. Call (920) 367-1272.',
  ],
];

$cities = [
  'green-bay-wi' => 'Green Bay',
  'appleton-wi'  => 'Appleton',
  'oshkosh-wi'   => 'Oshkosh',
  'de-pere-wi'   => 'De Pere',
  'howard-wi'    => 'Howard',
];

$skip = [2946]; // ya ajustada a mano segun el brief
$done = 0; $skipped = 0;

foreach ($services as $service_slug => $copy) {
    $hub = get_page_by_path($service_slug);
    if (!$hub) { echo "SIN HUB: $service_slug\n"; continue; }

    foreach ($cities as $city_slug => $city_name) {
        $page = get_page_by_path($service_slug . '/' . $city_slug);
        if (!$page) { echo "SIN PAGINA: $service_slug/$city_slug\n"; continue; }
        if (in_array($page->ID, $skip, true)) { $skipped++; continue; }

        $title = sprintf($copy['title'], $city_name);
        $h1    = sprintf($copy['h1'], $city_name);
        $desc  = sprintf($copy['desc'], $city_name);

        if (!get_post_meta($page->ID, '_geo_title_backup', true)) {
            update_post_meta($page->ID, '_geo_title_backup', $page->post_title);
        }
        wp_update_post(['ID' => $page->ID, 'post_title' => $h1]);
        update_post_meta($page->ID, 'surerank_settings_general', [
            'page_title'       => $title,
            'page_description' => $desc,
        ]);

        printf("%-34s title %2d · h1 %2d · desc %3d\n", $service_slug . '/' . $city_slug,
               strlen($title), strlen($h1), strlen($desc));
        $done++;
    }
}
echo "\nActualizadas: $done · Omitidas: $skipped\n";
