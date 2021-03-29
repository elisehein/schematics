import Figure from "./Figure.js";
import { Line, Path } from "./SVGElement.js";

export default class Figure5 extends Figure {
  draw() {
    super.draw();
    this.drawAxes()
    this.drawSpiral();
  }

  drawAxes() {
    const yAxis = new Line({x: 149, y: 220}, {x: 149, y: 30});
    this._canvas.appendChild(yAxis.node);

    const xAxis = new Line({x: 149, y: 220}, {x: 250, y: 205});
    this._canvas.appendChild(xAxis.node);

    const zAxis = new Line({x: 149, y: 220}, {x: 200, y: 260});
    this._canvas.appendChild(zAxis.node);
  }

  drawSpiral() {
    const spiral = new Path("M210,215 \
                             C 210,175, 90,175, 90,195 \
                             C 90,215, 210,215, 210,175 \
                             C 210,135, 90,135, 90,155 \
                             C 90,175, 210,175, 210,135 \
                             C 210,95, 90,95, 90,115 \
                             C 90,135, 210,135, 210,95");
    const spiralLength = 830;
    document.documentElement.style.setProperty(`--${this._figureClass}-spiral-length`, spiralLength);

    const node = spiral.node;
    node.classList.add(`${this._figureClass}__spiral`);
    this._canvas.appendChild(node);

    // This has to happen asynchronously for the CSS transition to take effect
    setTimeout(() => {
      node.classList.add(`${this._figureClass}__spiral--end`);
    })
  }
}