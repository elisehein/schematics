import Duration from "/helpers/Duration.js";

export default class Figure20PointerEvents {
  constructor(svgNode, timerManager) {
    this._svgNode = svgNode;
    this._svgReferencePoint = svgNode.createSVGPoint();

    this._timerManager = timerManager;
    this._leaveTimeout = new Duration({ milliseconds: 400 });
  }

  respondToPointer({ positionRespondsToMovement, onEnter, onMove, onLeave }) {
    this._respondingToMovement = false;
    this.respondToMouseLeave(onLeave);
    this.respondToMouseMove({ positionRespondsToMovement, onEnter, onMove, onLeave });
  }

  respondToMouseMove({ positionRespondsToMovement, onEnter, onMove, onLeave }) {
    this._svgNode.addEventListener("mousemove", event => {
      const pointerPosition = this.getPointerPositionInSVG(event);

      if (positionRespondsToMovement(pointerPosition)) {
        if (!this._respondingToMovement) {
          onEnter();
        }

        this._timerManager.clearTimeout(this._leaveTimeoutTimer);
        this._leaveTimeoutTimer = null;
        this._respondingToMovement = true;
      } else {
        this.leaveAfterTimeout(onLeave, pointerPosition);
      }

      if (this._respondingToMovement) {
        onMove(pointerPosition);
      }
    });
  }

  respondToMouseLeave(onLeave) {
    this._svgNode.addEventListener("mouseleave", event => {
      if (this._respondingToMovement) {
        this._respondingToMovement = false;
        this._leaveTimeoutTimer = null;
        onLeave(this.getPointerPositionInSVG(event));
      }
    });
  }

  leaveAfterTimeout(onLeave, pointerPosition) {
    if (!this._respondingToMovement || this._leaveTimeoutTimer) {
      return;
    }

    this._leaveTimeoutTimer = this._timerManager.setTimeout(() => {
      this._respondingToMovement = false;
      this._leaveTimeoutTimer = null;
      onLeave(pointerPosition);
    }, this._leaveTimeout.ms);
  }

  getPointerPositionInSVG(event){
    this._svgReferencePoint.x = event.clientX;
    this._svgReferencePoint.y = event.clientY;
    return this._svgReferencePoint.matrixTransform(this._svgNode.getScreenCTM().inverse());
  }
}
