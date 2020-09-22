/* eslint-disable prefer-object-spread */
//
// Assigns or removes a "wip" label
//

import { prMergeableState, prTitle, gitHubApi } from '../helpers';

const defaultLabel = 'wip';

const isWipRegEx = /\b(wip)\b/i;

export default async (label = defaultLabel) => {
  const mergeableState = prMergeableState;
  // eslint-disable-next-line no-console
  console.log('label', label);
  // eslint-disable-next-line no-console
  console.log('mergeableState', mergeableState);

  const existingLabels = danger.github.issue.labels.map(({ name }) => name);
  const isWip = prMergeableState === 'draft' || isWipRegEx.test(prTitle);
  let issue = { issue_number: 0, repo: '', owner: '' };

  // PR
  if (danger.github.thisPR) {
    const pr = danger.github.thisPR;
    issue = { issue_number: pr.number, repo: pr.repo, owner: pr.owner };
  }
  // Issue
  else {
    const gh = danger.github;
    issue = {
      issue_number: gh.issue.number,
      repo: gh.repository.name,
      owner: gh.repository.owner.login,
    };
  }

  if (isWip && !existingLabels.includes(label)) {
    const newLabels = existingLabels.slice();
    newLabels.push(label);
    await gitHubApi.issues.replaceLabels(
      Object.assign({}, issue, {
        labels: newLabels,
      }),
    );
  } else if (!isWip && existingLabels.includes(label)) {
    const newLabels = existingLabels.slice();
    newLabels.splice(existingLabels.indexOf(label), 1);
    await gitHubApi.issues.replaceLabels(
      Object.assign({}, issue, {
        labels: newLabels,
      }),
    );
  }
};
