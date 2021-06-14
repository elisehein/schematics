# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

* Compression scripts for CSS (using `cssnano`) and JS (using `terser` and `foreach-cli`) to run in production on Netlify ([#4](https://github.com/elisehein/schematics/pull/4)).
* Keyboard focusability for the SVG elements in figs. 18 and 36 ([#9](https://github.com/elisehein/schematics/pull/9)).
* ARIA roles and attributes to indicate the live figure region and toolbar controlling it ([#9](https://github.com/elisehein/schematics/pull/9)).
* A different a11y description for each figure depending on whether it's a thumbnail or not ([#9](https://github.com/elisehein/schematics/pull/9)).
* Reverse looping in fig. 42 after the caption has appeared ([#10](https://github.com/elisehein/schematics/pull/10)).

### Fixed

* Screen-reader friendly figure caption ([#9](https://github.com/elisehein/schematics/pull/9));

### Refactored

* Refactored how millisecond-second durations are handled ([#8](https://github.com/elisehein/schematics/pull/8)).

## [1.0.0] – 2021-06-12

The initial release of Schematics including the first five figures (figs 14, 18, 36, 42, 43).

[Unreleased]: https://github.com/elisehein/schematics/compare/1.0.0...staging
[1.0.0]: https://github.com/elisehein/schematics/compare/c8aa7d3e4fe78a3df0a3add04f7ba1d121b7a38e...1.0.0

