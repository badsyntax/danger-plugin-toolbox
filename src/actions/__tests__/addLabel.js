import addLabel from '../addLabel';
import * as helpers from '../../rules/helpers';

describe('addLabel', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    helpers.prMeta = {
      number: 1,
      repo: 'repo',
      owner: 'owner',
    };
    helpers.issue = {
      labels: [],
    };
    helpers.gitHubApi = {
      issues: {
        replaceLabels: jest.fn(() => ({
          then: () => {},
        })),
      },
    };
  });

  it('should add a label when PR is draft', async () => {
    helpers.prMergeableState = 'draft';
    helpers.issue.labels = [{ name: 'label' }];

    await addLabel();

    expect(helpers.gitHubApi.issues.replaceLabels).toHaveBeenCalledWith({
      issue_number: 1,
      labels: ['label', 'wip'],
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should not add a label when PR is draft and draft config is false', async () => {
    helpers.prMergeableState = 'draft';
    helpers.issue.labels = [{ name: 'label' }];
    helpers.prTitle = 'Title';

    await addLabel({
      draft: false,
    });

    expect(helpers.gitHubApi.issues.replaceLabels).not.toHaveBeenCalled();
  });

  test.each(['wip TITLE', 'wip: TITLE', '[WIP] title', 'TITLE [wip]'])(
    'should add a label when PR has "%s" in the PR title',
    async prTitle => {
      helpers.prMergeableState = 'clean';
      helpers.prTitle = prTitle;
      helpers.issue.labels = [{ name: 'label' }];

      await addLabel();

      expect(helpers.gitHubApi.issues.replaceLabels).toHaveBeenCalledWith({
        issue_number: 1,
        labels: ['label', 'wip'],
        owner: 'owner',
        repo: 'repo',
      });
    },
  );

  test.each(['Work In Progress: Title', 'Do not merge: Title'])(
    'should add a label with a custom term using pr title "%s"',
    async prTitle => {
      helpers.prMergeableState = 'clean';
      helpers.prTitle = prTitle;
      helpers.issue.labels = [{ name: 'label' }];

      await addLabel({ terms: ['Work In Progress', 'Do not merge'] });

      expect(helpers.gitHubApi.issues.replaceLabels).toHaveBeenCalledWith({
        issue_number: 1,
        labels: ['label', 'wip'],
        owner: 'owner',
        repo: 'repo',
      });
    },
  );

  it('should not add a label if terms array is empty', async () => {
    helpers.prMergeableState = 'clean';
    helpers.prTitle = 'Title';
    helpers.issue.labels = [{ name: 'label' }];

    await addLabel({ terms: [] });

    expect(helpers.gitHubApi.issues.replaceLabels).not.toHaveBeenCalled();
  });

  it('should add a custom label', async () => {
    helpers.prMergeableState = 'draft';
    helpers.issue.labels = [{ name: 'label' }];

    await addLabel({ label: 'WIP' });

    expect(helpers.gitHubApi.issues.replaceLabels).toHaveBeenCalledWith({
      issue_number: 1,
      labels: ['label', 'WIP'],
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should remove a label', async () => {
    helpers.prMergeableState = 'clean';
    helpers.prTitle = 'Pull Request';
    helpers.issue.labels = [{ name: 'wip' }];

    await addLabel();

    expect(helpers.gitHubApi.issues.replaceLabels).toHaveBeenCalledWith({
      issue_number: 1,
      labels: [],
      owner: 'owner',
      repo: 'repo',
    });
  });
});
