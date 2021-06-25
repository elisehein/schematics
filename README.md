### Quick start

This is a proof of concept JavaScript project to try out [The Stackless Way](https://tutorials.yax.com/articles/build-websites-the-yax-way/quicktakes/what-is-the-yax-way.html), an optimistic approach to client-side JavaScript development that proposes we “use the platform” (modern features built into the language) instead of build tools and frameworks.

As such, there is no build command to run or dependencies to install to view this project locally. Spin up a server in the `src` folder and point your (Custom Elements, ES6 modules, modern CSS capable) browser to `localhost:3000`.

```
python3 -m http.server 3000
```

## About this project

![Screenshot of the website](/screenshot.png)

#### Motion design
In 2011, I bought *[Schematics: A Love Story](http://julianhibbard.com/schematics.html), a collection of scientific diagrams accompanied by short pieces of poetry by [Julian Hibbard](http://julianhibbard.com). I don't read much poetry, and I’m only vaguely aware of the story each figure tries to tell. But I keep getting drawn in anyway, and the book's aesthetic always seemed like it would be fun to replicate digitally.

#### JavaScript without the build tools or frameworks

Those familiar with JavaScript know it’s not a language that you dip in and out of. You’d never keep up! I recently came across [The Stackless Way](https://tutorials.yax.com/articles/build-websites-the-yax-way/quicktakes/what-is-the-yax-way.html), an optimistic approach to client-side JavaScript development that proposes we “use the platform” (modern features built into the language) instead of frameworks and build tools that inevitably keep getting replaced by the next one. As a software engineer who’s spent the last decade trying to navigate the ecosystem all over again each time a project came up, the idea resonated.

This project combines my excitement for *Schematics* in motion with my curiosity about "stackless" web development.

* On the design side of things (motion and otherwise), I did my best to reproduce the vibe I got from *Schematics* (with kind feedback from the author). The diagrams are SVGs created programmatically with JavaScript and animated with [SMIL](https://developer.mozilla.org/en-US/docs/Web/SVG/SVG_animation_with_SMIL). I’ve enjoyed working with SVGs in the past and wanted to learn about the more complex aspects of SMIL animation beyond what can be done in CSS.

* On the technical side of things, I focused on vanilla JavaScript without the distraction of transpilers and bundlers. This has helped me to clear my head of the clutter of React, Babel, webpack and Rollup, and discover exactly what I get for free in 2021, and what value I'm adding by bringing a framework to the mix.

## Dependencies

In the spirit of The Stackless Way, I initially wanted to bite the bullet and, as with JS, only use vanilla CSS in this project. It was tedious, though manageable, until the first media query came along. At that point I gave up and added PostCSS because I cannot overstate the value of nested statements in responsive design.

Because CSS needs to be preprocessed, it's not *technically* a matter of spinning up a server and opening `localhost` (I've committed the built `main.css` file into the repo to make the point, though).

If you'd like to take a closer look at the codebase locally...

```
> npm install
> npm run dev
```

This processes CSS files when changed, and fires up a local server with livereload at port `4000`.

Installing npm dependencies also means you can run the Jest tests (`npm test`) and linters (`npm run lint:js`, `npm run lint:css`).
