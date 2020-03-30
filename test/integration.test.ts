import { makeClient } from '../lib/jira';
import { findOrCreateVersion } from '../lib/success';
import { PluginConfig } from '../lib/types';

import { context, pluginConfig } from './fakedata';

const itif = condition => condition ? it : it.skip;

const runIntegration = () => { return process.env.JIRA_AUTH && process.env.JIRA_HOST && process.env.JIRA_PROJECT_ID; };

describe('integration tests', () => {
  beforeAll(() => {
    context.env.JIRA_AUTH = process.env.JIRA_AUTH as string;
    pluginConfig.projectId = Number(process.env.JIRA_PROJECT_ID);
    pluginConfig.jiraHost = process.env.JIRA_HOST;
    pluginConfig.dryRun = false;
  });
  describe('release', () => {
    itif(runIntegration())('should create a release released with no date', async () => {
      jest.setTimeout(10000);
      pluginConfig.released = true;
      const jira = makeClient(pluginConfig as PluginConfig, context);
      const name = `test-${Date.now()}`;
      const res = await findOrCreateVersion(pluginConfig as PluginConfig, context, jira, pluginConfig.projectId, name);
      expect(res.name).toEqual(name);
      expect(res.released).toBeTruthy();
    });

    itif(runIntegration())('should create a release released with a date', async () => {
      jest.setTimeout(10000);
      pluginConfig.released = true;
      pluginConfig.releaseDate = true;
      const jira = makeClient(pluginConfig as PluginConfig, context);
      const name = `test-${Date.now()}`;
      const res = await findOrCreateVersion(pluginConfig as PluginConfig, context, jira, pluginConfig.projectId, name);
      expect(res.name).toEqual(name);
      expect(res.released).toBeTruthy();
      expect(res.releaseDate).toBeTruthy();
    });

    itif(runIntegration())('should create a release with released and releasedate undefined', async () => {
      jest.setTimeout(10000);
      const jira = makeClient(pluginConfig as PluginConfig, context);
      const name = `test-${Date.now()}`;
      const res = await findOrCreateVersion(pluginConfig as PluginConfig, context, jira, pluginConfig.projectId, name);
      expect(res.name).toEqual(name);
      expect(res.released).toBeTruthy();
      expect(res.releaseDate).toBeTruthy();
    });

  });
});
