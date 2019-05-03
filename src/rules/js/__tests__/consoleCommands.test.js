import * as helpers from '../../helpers';
import jsConsoleCommands from '../consoleCommands';

const buildMessage = filename =>
  `The file \`${filename}\` may contain console commands.`;

const validJs = 'valid.js';
const invalidJs = 'invalid.js';
const invalidJsCase = 'invalid.Js';
const invalidJsx = 'invalid.jsx';
const invalidTs = 'invalid.ts';
const mockFiles = {
  [validJs]: 'const foo = 42;',
  [invalidJs]: 'console.log("foo");',
  [invalidJsCase]: 'console.log("foo");',
  [invalidJsx]: 'console.log("foo");',
  [invalidTs]: 'console.log("foo");',
};

helpers.setMockFilesContent(mockFiles);

describe('jsConsoleCommands', () => {
  beforeEach(() => {
    global.warn = jest.fn();
    global.fail = jest.fn();

    jest.resetAllMocks();
  });

  it('should not warn when no console commands are used', async () => {
    const files = [validJs];
    helpers.setMockCommittedFiles(files);

    await jsConsoleCommands();

    expect(global.warn).not.toHaveBeenCalled();
  });

  it('should warn when any console command is used (js)', async () => {
    const files = [validJs, invalidJs];
    helpers.setMockCommittedFiles(files);

    const expectedMsg = buildMessage(invalidJs);

    await jsConsoleCommands();

    expect(global.warn).toHaveBeenCalledWith(expectedMsg);
  });

  it('should warn when any console command is used (jsx)', async () => {
    const files = [validJs, invalidJsx];
    helpers.setMockCommittedFiles(files);

    const expectedMsg = buildMessage(invalidJsx);

    await jsConsoleCommands();

    expect(global.warn).toHaveBeenCalledWith(expectedMsg);
  });

  it('should warn when any console command is used (ts)', async () => {
    const files = [validJs, invalidTs];
    helpers.setMockCommittedFiles(files);

    const expectedMsg = buildMessage(invalidTs);

    await jsConsoleCommands();

    expect(global.warn).toHaveBeenCalledWith(expectedMsg);
  });

  it('should ignore file extension casing', async () => {
    const files = [invalidJsCase];
    helpers.setMockCommittedFiles(files);

    await jsConsoleCommands();

    expect(global.warn).toHaveBeenCalledWith(
      expect.stringContaining(invalidJsCase),
    );
  });

  it('should log as "logType" when is provided', async () => {
    const files = [invalidJs];
    helpers.setMockCommittedFiles(files);

    await jsConsoleCommands({ logType: 'fail' });

    expect(global.warn).not.toHaveBeenCalled();
    expect(global.fail).toHaveBeenCalled();
  });
});