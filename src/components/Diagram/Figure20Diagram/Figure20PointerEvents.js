export default class Figure20PointerEvents {
  constructor(svgNode) {
    this._svgNode = svgNode;
    this._svgReferencePoint = svgNode.createSVGPoint();
  }

  respondToPointer({ positionRespondsToMovement, onMove, onLeave }) {
    this._respondingToMovement = false;
    this.respondToMouseLeave(onLeave);
    this.respondToMouseMove({ positionRespondsToMovement, onMove, onLeave });
  }

  respondToMouseMove({ positionRespondsToMovement, onMove, onLeave }) {
    this._svgNode.addEventListener("mousemove", event => {
      const pointerPosition = this.getPointerPositionInSVG(event);

      if (!positionRespondsToMovement(pointerPosition)) {
        if (this._respondingToMovement) {
          this._respondingToMovement = false;
          onLeave(pointerPosition);
        }
        return;
      }

      this._respondingToMovement = true;
      onMove(pointerPosition);
    });
  }

  respondToMouseLeave(onLeave) {
    this._svgNode.addEventListener("mouseleave", event => {
      if (this._respondingToMovement) {
        this._respondingToMovement = false;
        const pointerPosition = this.getPointerPositionInSVG(event);
        onLeave(pointerPosition);
      }
    });
  }

  getPointerPositionInSVG(event){
    this._svgReferencePoint.x = event.clientX;
    this._svgReferencePoint.y = event.clientY;
    return this._svgReferencePoint.matrixTransform(this._svgNode.getScreenCTM().inverse());
  }
}