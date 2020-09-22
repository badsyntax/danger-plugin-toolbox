//
// Assigns or removes a "wip" label
//

import { prMergeableState, prTitle } from '../helpers';

const defaultLabel = 'wip';

const isWipRegEx = /\b(wip)\b/i;

export default (label = defaultLabel) => {
  const mergeableState = prMergeableState;
  // eslint-disable-next-line no-console
  console.log('label', label);
  // eslint-disable-next-line no-console
  console.log('mergeableState', mergeableState);

  const isWip = prMergeableState === 'draft' || isWipRegEx.test(prTitle);

  // eslint-disable-next-line no-console
  console.log('isWip', isWip);
};
