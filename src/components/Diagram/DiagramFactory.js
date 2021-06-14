import Figure14Diagram from "./Figure14Diagram.js";
import Figure18Diagram from "./Figure18Diagram/Figure18Diagram.js";
import Figure20Diagram from "./Figure20Diagram.js";
import Figure36Diagram from "./Figure36Diagram/Figure36Diagram.js";
import Figure42Diagram from "./Figure42Diagram.js";
import Figure43Diagram from "./Figure43Diagram.js";

export default function DiagramFactory(figureBehaviorCallbacks) {
  return (num, isThumbnail = false) => {
    switch (num) {
      case 14:
        return new Figure14Diagram(isThumbnail, figureBehaviorCallbacks);
      case 18:
        return new Figure18Diagram(isThumbnail, figureBehaviorCallbacks);
      case 20:
        return new Figure20Diagram(isThumbnail, figureBehaviorCallbacks);
      case 36:
        return new Figure36Diagram(isThumbnail, figureBehaviorCallbacks);
      case 42:
        return new Figure42Diagram(isThumbnail, figureBehaviorCallbacks);
      case 43:
        return new Figure43Diagram(isThumbnail, figureBehaviorCallbacks);
      default:
        throw new Error(`No diagram element specified for figure ${num}.`);
    }
  };
}
