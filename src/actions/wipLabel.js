//
// Assigns or removes a "wip" label
//

import { prMergeableState, prTitle, gitHubApi } from '../rules/helpers';

const defaultLabel = 'wip';
const defaultTerms = ['wip'];

function hasWipTitle(terms) {
  const regExp = new RegExp(`\\b(${terms.join('|')})\\b`, 'i');
  return regExp.test(prTitle);
}

function isWipped(terms) {
  return prMergeableState === 'draft' || hasWipTitle(terms);
}

function getIssueWithLabels(labels) {
  // eslint-disable-next-line camelcase
  const { number: issue_number, repo, owner } = danger.github.thisPR;
  return {
    issue_number,
    repo,
    owner,
    labels,
  };
}

function saveIssueLabels(labels) {
  return gitHubApi.issues.replaceLabels(getIssueWithLabels(labels));
}

function addLabel(existingLabels, label) {
  const labels = existingLabels.slice();
  labels.push(label);
  return saveIssueLabels(labels);
}

function removeLabel(existingLabels, label) {
  const labels = existingLabels.slice();
  labels.splice(existingLabels.indexOf(label), 1);
  return saveIssueLabels(labels);
}

export default async ({ label = defaultLabel, terms = defaultTerms } = {}) => {
  const existingLabels = danger.github.issue.labels.map(({ name }) => name);
  const isWip = isWipped(terms);
  const hasLabel = existingLabels.includes(label);

  if (isWip && !hasLabel) {
    return addLabel(existingLabels, label);
  }
  if (!isWip && hasLabel) {
    return removeLabel(existingLabels, label);
  }
  return null;
};
