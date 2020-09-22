import wipLabel from '../wipLabel';
import * as helpers from '../../rules/helpers';

describe('wipLabel', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    global.danger = {
      github: {
        thisPR: {
          number: 1,
          repo: 'repo',
          owner: 'owner',
        },
        issue: {
          labels: [],
        },
      },
    };
    helpers.gitHubApi = {
      issues: {
        replaceLabels: jest.fn(),
      },
    };
  });

  it('should add a label when PR is draft', async () => {
    helpers.prMergeableState = 'draft';
    global.danger.github.issue.labels = [{ name: 'label' }];

    await wipLabel();

    expect(helpers.gitHubApi.issues.replaceLabels).toHaveBeenCalledWith({
      issue_number: 1,
      labels: ['label', 'wip'],
      owner: 'owner',
      repo: 'repo',
    });
  });

  test.each(['wip TITLE', 'wip: TITLE', '[WIP] title', 'TITLE [wip]'])(
    'should add a label when PR has "%s" in the PR title',
    async prTitle => {
      helpers.prMergeableState = 'clean';
      helpers.prTitle = prTitle;
      global.danger.github.issue.labels = [{ name: 'label' }];

      await wipLabel();

      expect(helpers.gitHubApi.issues.replaceLabels).toHaveBeenCalledWith({
        issue_number: 1,
        labels: ['label', 'wip'],
        owner: 'owner',
        repo: 'repo',
      });
    },
  );

  it('should add a label with a custom term', async () => {
    helpers.prMergeableState = 'clean';
    helpers.prTitle = 'Work In Progress: Title';
    global.danger.github.issue.labels = [{ name: 'label' }];

    await wipLabel({ terms: ['Work In Progress'] });

    expect(helpers.gitHubApi.issues.replaceLabels).toHaveBeenCalledWith({
      issue_number: 1,
      labels: ['label', 'wip'],
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should add a custom label', async () => {
    helpers.prMergeableState = 'draft';
    global.danger.github.issue.labels = [{ name: 'label' }];

    await wipLabel({ label: 'WIP' });

    expect(helpers.gitHubApi.issues.replaceLabels).toHaveBeenCalledWith({
      issue_number: 1,
      labels: ['label', 'WIP'],
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should remove a label when PR is draft and title is not wipped', async () => {
    helpers.prMergeableState = 'clean';
    helpers.prTitle = 'Pull Request';
    global.danger.github.issue.labels = [{ name: 'wip' }];

    await wipLabel();

    expect(helpers.gitHubApi.issues.replaceLabels).toHaveBeenCalledWith({
      issue_number: 1,
      labels: [],
      owner: 'owner',
      repo: 'repo',
    });
  });
});
