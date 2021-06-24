export default class Figure20PointerEvents {
  constructor(svgNode) {
    this._svgNode = svgNode;
    this._svgReferencePoint = svgNode.createSVGPoint();
  }

  respondToPointer({ positionRespondsToMovement, onEnter, onMove, onLeave }) {
    this._respondingToMovement = false;
    this.respondToMouseLeave(onLeave);
    this.respondToMouseMove({ positionRespondsToMovement, onEnter, onMove, onLeave });
  }

  respondToMouseMove({ positionRespondsToMovement, onEnter, onMove, onLeave }) {
    this._svgNode.addEventListener("mousemove", event => {
      const pointerPosition = this.getPointerPositionInSVG(event);

      if (!positionRespondsToMovement(pointerPosition)) {
        this._respondingToMovement = false;
        onLeave(pointerPosition);
        return;
      }

      if (this._respondingToMovement) {
        onMove(pointerPosition);
      } else {
        onEnter(pointerPosition);
      }

      this._respondingToMovement = true;
    });
  }

  respondToMouseLeave(onLeave) {
    this._svgNode.addEventListener("mouseleave", event => {
      if (this._respondingToMovement) {
        this._respondingToMovement = false;
        onLeave(this.getPointerPositionInSVG(event));
      }
    });
  }

  getPointerPositionInSVG(event){
    this._svgReferencePoint.x = event.clientX;
    this._svgReferencePoint.y = event.clientY;
    return this._svgReferencePoint.matrixTransform(this._svgNode.getScreenCTM().inverse());
  }
}
