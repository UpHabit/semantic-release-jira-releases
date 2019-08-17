import JiraClient from 'jira-connector';

import { PluginConfig, PluginContext } from './types';

export function makeClient(config: PluginConfig, context: PluginContext): JiraClient {
  return new JiraClient({
    host: config.jiraHost,
    port: config.jiraPort,
    protocol: config.jiraProtocol,
    basic_auth: {
      base64: context.env.JIRA_AUTH,
    },
  });
}
