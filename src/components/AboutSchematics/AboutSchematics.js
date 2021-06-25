import transitionWithClasses from "/helpers/transitionWithClasses.js";

export default class AboutSchematics extends HTMLElement {
  connectedCallback() {
    /* eslint-disable max-len */
    this.innerHTML = `
<article>
  <p>
    In 2011, I bought <em><a href="http://julianhibbard.com/schematics.html">Schematics: A Love Story</a></em>, a collection of mathematical diagrams accompanied by short pieces of poetry by <a href="http://julianhibbard.com/schematics.html">Julian Hibbard</a>. As someone largely ignorant of art, I’m only vaguely aware of the story each figure tries to tell. But I keep getting drawn in anyway, and the book's aesthetic always seemed like it would be fun to replicate digitally.
  </p>

  <p>
    Those familiar with JavaScript know it’s not a language that you dip in and out of. You’d never keep up! I recently came across <a href="https://tutorials.yax.com/articles/build-websites-the-yax-way/quicktakes/what-is-the-yax-way.html">The Stackless Way</a>, an optimistic take on client-side JavaScript development that proposes we “use the platform” (modern features built into the language) instead of frameworks and build tools that inevitably keep getting replaced by the next one. As a software engineer who’s spent the last decade trying to navigate the ecosystem all over again each time a project came up, the idea resonated.
  </p>

  <p>
    This project combines my excitement for <em>Schematics</em> in motion with my curiosity about "stackless" web development.
  </p>

  <ul>
    <li>
      <p>
        On the design side of things (motion and otherwise), I did my best to reproduce the vibe I got from <em>Schematics</em> (with kind feedback from the author). The diagrams are SVGs created programmatically with JavaScript and animated with <a href="https://developer.mozilla.org/en-US/docs/Web/SVG/SVG_animation_with_SMIL">SMIL</a>. I’ve enjoyed working with SVGs in the past and wanted to learn about the more complex aspects of SMIL animation beyond what can be done in CSS.
      </p>
    </li>
    <li>
      <p>
        On the technical side of things, I focused on vanilla JavaScript without the distraction of transpilers and bundlers. This has helped me to clear my head of the clutter of React, Babel, webpack and Rollup, and discover exactly what I get for free in 2021, and what value I'm adding by bringing a framework to the mix.
      </p>
    </li>
  </ul>

  <p>
    If you're interested in stackless web development, take a look at the <a href="https://github.com/elisehein/schematics">codebase</a> for more implementation details. If you just stumbled here and don't care about JavaScript or SVGs, I hope you find the visual poetry of <em>Schematics</em> as interesting as I do.
  </p>

  <small>
  Elise<br/>
  <a href="https://elisehe.in">elisehe.in</a>
  </small>

</article>
    `;
    /* eslint-enable max-len */
  }

  show() {
    this.style.display = "block";
    document.documentElement.scrollTop = 0;
  }

  hide(onDone = () => {}) {
    transitionWithClasses(this, ["about-schematics--hiding"], () => {
      this.style.display = "none";
      onDone();
    });
  }
}

customElements.define("about-schematics", AboutSchematics);
