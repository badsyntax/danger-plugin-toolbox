//
// List file lines containing warnings (like "warning" or "warning:").
//

import fs from 'fs';

import getMessageLogger from '../getMessageLogger';

export default (file, { logType, msg, ignoreRegex } = {}) => {
  if (!file) {
    warn('`commonFileWarnings`: missing "file" parameter');
  } else {
    const contents = fs.readFileSync(file).toString();
    let warnings = contents.match(/^.*\bwarning( |:).*$/gim);
    if (ignoreRegex) {
      warnings = warnings.filter(warning => !warning.match(ignoreRegex));
    }
    if (warnings && warnings.length) {
      const log = getMessageLogger(logType);
      const warningsStr = warnings.map(line => `- ${line}`).join('\n');
      const introMsg =
        msg || `The file \`${file}\` contains the following warnings:`;
      log(`${introMsg}\n${warningsStr}`);
    }
  }
};
