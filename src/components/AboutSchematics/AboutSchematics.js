import transitionWithClasses from "/helpers/transitionWithClasses.js";

export default class AboutSchematics extends HTMLElement {
  // eslint-disable-next-line max-lines-per-function
  connectedCallback() {
    /* eslint-disable max-len */
    this.innerHTML = `
<article>
  <p>
    In 2011, I bought <em><a href="http://julianhibbard.com/schematics.html">Schematics: A Love Story</a></em>, a collection of scientific diagrams paired with short pieces of poetry by <a href="http://julianhibbard.com/schematics.html">Julian Hibbard</a>. I don’t read much poetry and I’m sure some of the hidden narratives are lost on me. But it’s a beautiful book, and the figures always seemed like they would be fun to replicate as animated graphics.
  </p>

  <p>
    This project is my take on the motion design for <em>Schematics</em> using JavaScript and SVG.
  </p>

  <ul>
    <li>
      <h3>The graphics.</h3>
      <p>
        I did my best to reproduce the vibe I got from the book (with kind feedback from the author). The diagrams are SVG created programmatically with JavaScript and animated with <a href="https://developer.mozilla.org/en-US/docs/Web/SVG/SVG_animation_with_SMIL">SMIL</a>. I’ve enjoyed working with SVG in the past and wanted to learn about the more complex aspects of SMIL animation beyond what can be done in CSS.
      </p>
    </li>
    <li>
      <h3>Stackless JavaScript.</h3>
      <p>
        Those familiar with JavaScript know it’s not a language that you dip in and out of. You’d never keep up! I recently came across <a href="https://tutorials.yax.com/articles/build-websites-the-yax-way/quicktakes/what-is-the-yax-way.html">The Stackless Way</a>, an optimistic take on client-side JavaScript development that proposes we “use the platform” (modern features built into the language) instead of frameworks and build tools that inevitably keep getting replaced by the next one.
      </p>
      <p>
        To a software engineer who’s spent the last decade trying to navigate the ecosystem all over again each time a project came up, the idea resonates. Using <em>Schematics</em> as a proof of concept playground, going stackless has been a way of rediscovering exactly what I get for free in 2021, and what value I’m adding by bringing frameworks, transpilers and bundlers to the mix.
      </p>
    </li>
  </ul>

  <p>
    If you're interested in stackless web development, take a look at the <a href="https://github.com/elisehein/schematics">codebase</a> and <a href="https://elisehe.in/2021/08/22/using-the-platform.html">accompanying blog post</a> for more implementation details. If you just stumbled here and don't care about JavaScript or SVG, I hope you find the visual poetry of <em>Schematics</em> as interesting as I do.
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
