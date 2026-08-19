<?php
// Segunda pasada: las descriptions de la primera quedaron entre 148 y 162
// caracteres y Google corta cerca de 155. Se reescriben mas cortas sin perder
// el servicio, la ciudad ni la llamada a la accion. Los titles no se tocan.
$desc = [
  'kitchen-remodeling'   => 'Kitchen remodeling in %s, WI by a licensed contractor. Cabinets, countertops and full renovations. Free estimate in 24 hours. (920) 367-1272.',
  'bathroom-remodeling'  => 'Bathroom remodeling in %s, WI by a licensed contractor. Tile showers, vanities and full remodels. Free estimate in 24 hours. (920) 367-1272.',
  'deck-building'        => 'Deck builder in %s, WI. Cedar and composite decks, multi-level builds, permits handled. Free estimate in 24 hours. (920) 367-1272.',
  'finish-carpentry'     => 'Finish carpentry in %s, WI. Trim, baseboards, crown molding and interior doors. Free estimate in 24 hours. (920) 367-1272.',
  'home-renovation'      => 'Home renovation in %s, WI. Basement finishing, additions and whole-house remodels. Free estimate in 24 hours. (920) 367-1272.',
  'general-construction' => 'General contractor in %s, WI. Custom homes, additions, framing and commercial construction. Free estimate in 24 hours. (920) 367-1272.',
];
$cities = ['green-bay-wi'=>'Green Bay','appleton-wi'=>'Appleton','oshkosh-wi'=>'Oshkosh','de-pere-wi'=>'De Pere','howard-wi'=>'Howard'];
$max = 0; $n = 0;
foreach ($desc as $svc => $tpl) {
  foreach ($cities as $slug => $city) {
    $page = get_page_by_path("$svc/$slug");
    if (!$page) continue;
    $cur = get_post_meta($page->ID, 'surerank_settings_general', true);
    if (!is_array($cur)) $cur = [];
    $d = sprintf($tpl, $city);
    $cur['page_description'] = $d;
    update_post_meta($page->ID, 'surerank_settings_general', $cur);
    $max = max($max, strlen($d)); $n++;
  }
}
echo "Descriptions reescritas: $n · la mas larga: $max caracteres\n";
