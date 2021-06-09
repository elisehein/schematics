
// Each orderedAction must be a function that takes { onDone }
export const runActionsSequentially = (orderedActions, onAllDone = () => {}) => {
  const runActions = index => {
    const nextIndex = index + 1;
    const onActionDone = nextIndex >= orderedActions.length ? onAllDone : runActions.bind(null, nextIndex);
    orderedActions[index]({ onDone: onActionDone });
  };

  runActions(0);
};

// eslint-disable-next-line arrow-body-style
export const waitBeforeNextAction = (delay, timerManager) => {
  return ({ onDone }) => timerManager.setTimeout(onDone, delay);
};
