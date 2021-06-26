export default function DiagramFactory(figureBehaviorCallbacks) {
  return async (num, isThumbnail = false) => {
    let module;

    switch (num) {
      case 14:
        module = await import("./Figure14Diagram.js");
        break;
      case 18:
        module = await import("./Figure18Diagram/Figure18Diagram.js");
        break;
      case 20:
        module = await import("./Figure20Diagram/Figure20Diagram.js");
        break;
      case 36:
        module = await import("./Figure36Diagram/Figure36Diagram.js");
        break;
      case 42:
        module = await import("./Figure42Diagram.js");
        break;
      case 43:
        module = await import("./Figure43Diagram/Figure43Diagram.js");
        break;
      default:
        throw new Error(`No diagram element specified for figure ${num}.`);
    }

    const Diagram = module.default;
    return new Diagram(isThumbnail, figureBehaviorCallbacks);
  };
}
