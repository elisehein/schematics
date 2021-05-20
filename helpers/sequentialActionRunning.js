
// Each orderedAction must be a function that takes { onDone }
export const runActionsSequentially = (orderedActions, onAllDone = () => {}) => {
  const runActions = index => {
    const nextIndex = index + 1;
    const onActionDone = nextIndex >= orderedActions.length ? onAllDone : runActions.bind(this, nextIndex);
    orderedActions[index]({ onDone: onActionDone });
  }

  runActions(0);
}

export const waitBeforeNextAction = delay => {
  return ({ onDone }) => setTimeout(onDone, delay);
};
