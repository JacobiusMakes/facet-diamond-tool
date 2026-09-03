<?php
/**
 * Plugin Name: Facet Diamond Size
 * Plugin URI: https://jacobiusmakes.github.io/facet-diamond-tool/widget-demo.html
 * Description: Add a private diamond face-up size calculator with the [facet_diamond_size] shortcode.
 * Version: 0.2.0
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
            'commerce' => 'off',
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
    $commerce = in_array(strtolower((string) $attributes['commerce']), array('on', 'yes', 'true', '1'), true) ? 'on' : 'off';

    wp_enqueue_script(
        'facet-diamond-size',
        plugins_url('assets/facet-widget.js', __FILE__),
        array(),
        '0.4.1',
        true
    );

    return sprintf(
        '<facet-diamond-size publisher="%1$s" shape="%2$s" carat="%3$s" theme="%4$s" commerce="%5$s"></facet-diamond-size>',
        esc_attr(substr($publisher, 0, 48)),
        esc_attr($shape),
        esc_attr(number_format($carat, 2, '.', '')),
        esc_attr($theme),
        esc_attr($commerce)
    );
}
add_shortcode('facet_diamond_size', 'facet_diamond_size_shortcode');

function facet_diamond_size_plugin_links($links) {
    $docs = '<a href="https://jacobiusmakes.github.io/facet-diamond-tool/widget-demo.html">Publisher kit</a>';
    array_unshift($links, $docs);
    return $links;
}
add_filter('plugin_action_links_' . plugin_basename(__FILE__), 'facet_diamond_size_plugin_links');
