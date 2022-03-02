import { pluginConfig, pluginContext } from './fakedata';

function throwOnJiraGetProject(mockError: string | Error): void {
  jest.mock('jira-connector', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      project: {
        getProject: () => {
          throw mockError;
        },
      },
    })),
  }));
}

describe('verifyConditions', () => {
  afterEach(() => {
    jest.resetModules();
  });

  describe('JIRA connection check', () => {
    it('catches status errors', () => {
      throwOnJiraGetProject('{"statusCode": 401, "response": ""}');
      const verifyConditions = require('../lib/verifyConditions').verifyConditions;
      expect(() => verifyConditions(pluginConfig, pluginContext)).rejects.toThrow('connecting to jira failed with status 401');
    });

    it('catches other errors', () => {
      throwOnJiraGetProject(new Error('foobar'));
      const verifyConditions = require('../lib/verifyConditions').verifyConditions;
      expect(() => verifyConditions(pluginConfig, pluginContext)).rejects.toThrow('connecting to jira failed');
    });
  });
});
