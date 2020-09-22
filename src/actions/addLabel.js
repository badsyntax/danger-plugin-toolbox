//
// Assigns or removes a "wip" label
//

import {
  prMergeableState,
  prTitle,
  prMeta,
  gitHubApi,
  issue,
} from '../rules/helpers';

const defaultLabel = 'wip';
const defaultTerms = ['wip'];

function hasWipTitle(terms) {
  if (!terms.length) {
    return false;
  }
  return terms.some(term => {
    if (term instanceof RegExp) {
      return test.test(prTitle);
    }
    return new RegExp(`\\b(${term})\\b`, 'i').test(prTitle);
  });
}

function isWipped(draft, terms) {
  return (draft && prMergeableState === 'draft') || hasWipTitle(terms);
}

function getIssueWithLabels(labels) {
  // eslint-disable-next-line camelcase
  const { number: issue_number, repo, owner } = prMeta;
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
  return saveIssueLabels(labels).then(() => {
    // eslint-disable-next-line no-console
    console.log(`👍 Added label "${label}"`);
  });
}

function removeLabel(existingLabels, label) {
  const labels = existingLabels.slice();
  labels.splice(existingLabels.indexOf(label), 1);
  return saveIssueLabels(labels).then(() => {
    // eslint-disable-next-line no-console
    console.log(`👍 Removed label "${label}"`);
  });
}

export default async ({
  label = defaultLabel,
  terms = defaultTerms,
  draft = true,
} = {}) => {
  const existingLabels = issue.labels.map(({ name }) => name);
  const isWip = isWipped(draft, terms);
  const hasLabel = existingLabels.includes(label);

  if (isWip && !hasLabel) {
    return addLabel(existingLabels, label);
  }
  if (!isWip && hasLabel) {
    return removeLabel(existingLabels, label);
  }
  return null;
};
