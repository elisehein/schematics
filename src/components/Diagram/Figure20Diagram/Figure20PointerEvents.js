const pointerStates = {
  ENTERED_BUT_NOT_MOVED: "ENTERED_BUT_NOT_MOVED",
  ENTERED_AND_MOVED: "ENTERED_AND_MOVED",
  NOT_ENTERED: "NOT_ENTERED"
};

export default class Figure20PointerEvents {
  constructor(svgNode) {
    this._svgNode = svgNode;
    this._svgReferencePoint = svgNode.createSVGPoint();
    this._state = pointerStates.NOT_ENTERED;
  }

  respondToPointer({ positionRespondsToMovement, onEnter, onMove, onLeave }) {
    this.respondToMouseLeave(onLeave);
    this.respondToMouseMove({ positionRespondsToMovement, onEnter, onMove, onLeave });
  }

  respondToMouseMove({ positionRespondsToMovement, onEnter, onMove, onLeave }) {
    this._svgNode.addEventListener("mousemove", event => {
      const pointerPosition = this.getPointerPositionInSVG(event);

      if (!positionRespondsToMovement(pointerPosition)) {
        this._state = pointerStates.NOT_ENTERED;
        onLeave(pointerPosition);
        return;
      }

      if (this.respondingToMovement) {
        onMove(pointerPosition);
        this._state = pointerStates.ENTERED_AND_MOVED;
      } else {
        this._state = pointerStates.ENTERED_BUT_NOT_MOVED;
        onEnter(pointerPosition);
      }
    });
  }

  respondToMouseLeave(onLeave) {
    this._svgNode.addEventListener("mouseleave", event => {
      if (this.respondintToMovement) {
        this._state = pointerStates.NOT_ENTERED;
        onLeave(this.getPointerPositionInSVG(event));
      }
    });
  }

  getPointerPositionInSVG(event){
    this._svgReferencePoint.x = event.clientX;
    this._svgReferencePoint.y = event.clientY;
    return this._svgReferencePoint.matrixTransform(this._svgNode.getScreenCTM().inverse());
  }

  get pointerJustEntered() {
    return this._state == pointerStates.ENTERED_BUT_NOT_MOVED;
  }

  get respondingToMovement() {
    return this._state !== pointerStates.NOT_ENTERED;
  }
}

