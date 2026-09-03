=== Facet Diamond Size ===
Contributors: stienhardt
Tags: diamond, carat, engagement ring, calculator, shortcode
Requires at least: 6.0
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 0.2.0
License: MIT

A private diamond face-up size calculator for articles and resource pages.

== Description ==

Facet converts a selected diamond shape and carat weight into an approximate
face-up size in millimeters. It sets no cookie and stores no customer data.
The default calculator contains no external link. A site owner can explicitly
turn on an attributed inventory link with the commerce shortcode option.

Facet is made by Stienhardt & Stones, a New York City jeweler that sources
certified Lab Grown Diamonds and hand-sets and finishes rings in NYC.

== Installation ==

1. Upload the facet-diamond-size folder to /wp-content/plugins/ or install the ZIP.
2. Activate Facet Diamond Size.
3. Add [facet_diamond_size] to any post, page, or Shortcode block.

Optional shortcode attributes:

[facet_diamond_size publisher="your-publication" shape="oval" carat="1.50" theme="light" commerce="off"]

Supported shapes are round, oval, emerald, and dutch_marquise. If publisher is
omitted, the plugin derives a public slug from the site's hostname.

To add an attributed inventory link, set commerce="on". The link contains only
the public publisher slug, selected shape, and carat weight.

== Privacy ==

The component sets no cookie, makes no background analytics request, and stores
no customer data. The default output contains no external link. If the site
owner turns commerce on, the inventory link contains only a public publisher
slug, shape, and carat weight.

== Changelog ==

= 0.2.0 =
* Bundles the calculator script inside the plugin.
* Keeps external inventory links off unless the site owner explicitly enables them.
* Uses Facet component 0.4.1.

= 0.1.1 =
* Uses Facet component 0.3.1 with corrected round-shape artwork.

= 0.1.0 =
* First public package.
