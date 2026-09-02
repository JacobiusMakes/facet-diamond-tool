<?php
/**
 * Plugin Name: Facet Diamond Size
 * Plugin URI: https://jacobiusmakes.github.io/facet-diamond-tool/widget-demo.html
 * Description: Add a private diamond face-up size calculator with the [facet_diamond_size] shortcode.
 * Version: 0.1.1
 * Author: Stienhardt & Stones
 * Author URI: https://stienhardt.com/
 * License: MIT
 * Requires at least: 6.0
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) {
    exit;
}

function facet_diamond_size_shortcode($attributes) {
    $attributes = shortcode_atts(
        array(
            'publisher' => '',
            'shape' => 'oval',
            'carat' => '1.50',
            'theme' => 'light',
        ),
        $attributes,
        'facet_diamond_size'
    );

    $allowed_shapes = array('round', 'oval', 'emerald', 'dutch_marquise');
    $shape = sanitize_key($attributes['shape']);
    if (!in_array($shape, $allowed_shapes, true)) {
        $shape = 'oval';
    }

    $carat = (float) $attributes['carat'];
    $carat = max(0.1, min(20, $carat));

    $publisher = sanitize_key($attributes['publisher']);
    if ($publisher === '') {
        $host = wp_parse_url(home_url(), PHP_URL_HOST);
        $publisher = sanitize_key(str_replace('.', '_', (string) $host));
    }
    if ($publisher === '') {
        $publisher = 'wordpress';
    }

    $theme = $attributes['theme'] === 'dark' ? 'dark' : 'light';

    wp_enqueue_script(
        'facet-diamond-size',
        'https://cdn.jsdelivr.net/gh/JacobiusMakes/facet-diamond-tool@v0.3.1/facet-widget.js',
        array(),
        '0.3.1',
        true
    );

    return sprintf(
        '<facet-diamond-size publisher="%1$s" shape="%2$s" carat="%3$s" theme="%4$s"></facet-diamond-size>',
        esc_attr(substr($publisher, 0, 48)),
        esc_attr($shape),
        esc_attr(number_format($carat, 2, '.', '')),
        esc_attr($theme)
    );
}
add_shortcode('facet_diamond_size', 'facet_diamond_size_shortcode');

function facet_diamond_size_plugin_links($links) {
    $docs = '<a href="https://jacobiusmakes.github.io/facet-diamond-tool/widget-demo.html">Publisher kit</a>';
    array_unshift($links, $docs);
    return $links;
}
add_filter('plugin_action_links_' . plugin_basename(__FILE__), 'facet_diamond_size_plugin_links');
