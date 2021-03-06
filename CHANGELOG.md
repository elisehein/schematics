# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.4] – 2021-12-31

### Fixed

* Made the current year in the copyright string dynamic.

## [1.2.3] - 2021-10-3

### Added

* Add "Using the platform" blog post link to about page and README.

## [1.2.2] - 2021-08-25

### Added

* Added all meta tags for OG and other previews along with a preview image.

## [1.2.1] - 2021-06-27

### Fixed

* Fixed toolbar underline behaviour after adding an extra link to fig. 20.

## [1.2.0] - 2021-06-27

### Added

* Figure 20 ([#14](https://github.com/elisehein/schematics/pull/14), [#15](https://github.com/elisehein/schematics/pull/15))
* Dynamic imports for diagram drawing (import as few modules as possible to draw the thumbnail, until we actually need to draw the full figure).
* Dynamic imports in the diagram factory. This has the effect of allowing the previews element to load first before fetchig thumbnails, and it allows for only the requested figure modules to be loaded when navigating directly to an individual figure.

### Changed

* Make the body background *slightly* lighter for *slightly* increased contrast.
* Improved structure on *About* page.
* Disabled selection on `schematics-figure` to avoid accidental ugly scanlines.

### Refactored

* Added convenience `milliseconds()` and `seconds()` properties on the `Number` prototype to initialise `Duration`s.
* Separated `FigureCaption` into its own element which allows for additional animations on the caption to be run after it's been typed in ([#15](https://github.com/elisehein/schematics/pull/15)).

## [1.1.0] – 2021-06-18

### Added

* Compression scripts for CSS (using `cssnano`) and JS (using `terser` and `foreach-cli`) to run in production on Netlify ([#4](https://github.com/elisehein/schematics/pull/4)).
* Keyboard focusability for the SVG elements in figs. 18 and 36 ([#9](https://github.com/elisehein/schematics/pull/9)).
* ARIA roles and attributes to indicate the live figure region and toolbar controlling it ([#9](https://github.com/elisehein/schematics/pull/9)).
* A different a11y description for each figure depending on whether it's a thumbnail or not ([#9](https://github.com/elisehein/schematics/pull/9)).
* Reverse looping in fig. 42 after the caption has appeared ([#10](https://github.com/elisehein/schematics/pull/10)).
* Light up fig. 18 when new boxes are drawn ([#11](https://github.com/elisehein/schematics/pull/11)).

### Changed

* Replaced simplistic SVG cube animation with HTML + CSS 3D animation in fig. 43 ([#12](https://github.com/elisehein/schematics/pull/12)).
* Changed the figure hiding effect to include a quick subtle drop-shadow.

### Fixed

* Screen-reader friendly figure caption ([#9](https://github.com/elisehein/schematics/pull/9));

### Refactored

* Refactored how millisecond-second durations are handled ([#8](https://github.com/elisehein/schematics/pull/8)).
* Split `Diagram` into `SVG` and `HTML` subtypes ([#12](https://github.com/elisehein/schematics/pull/12)).

## [1.0.0] – 2021-06-12

The initial release of Schematics including the first five figures (figs 14, 18, 36, 42, 43).

[Unreleased]: https://github.com/elisehein/schematics/compare/1.2.4...staging
[1.2.4]: https://github.com/elisehein/schematics/compare/1.2.3...1.2.4
[1.2.3]: https://github.com/elisehein/schematics/compare/1.2.2...1.2.3
[1.2.2]: https://github.com/elisehein/schematics/compare/1.2.1...1.2.2
[1.2.1]: https://github.com/elisehein/schematics/compare/1.2.0...1.2.1
[1.2.0]: https://github.com/elisehein/schematics/compare/1.1.0...1.2.0
[1.1.0]: https://github.com/elisehein/schematics/compare/1.0.0...1.1.0
[1.0.0]: https://github.com/elisehein/schematics/compare/c8aa7d3e4fe78a3df0a3add04f7ba1d121b7a38e...1.0.0

