import SemanticReleaseError from '@semantic-release/error';

import { makeClient } from './jira';
import { PluginConfig, PluginContext } from './types';

export async function verifyConditions(config: PluginConfig, context: PluginContext): Promise<void> {
  const { networkConcurrency } = config;

  if (typeof config.jiraHost !== 'string') {
    throw new SemanticReleaseError(`config.jiraHost must be a string`);
  }
  if (typeof config.projectId !== 'string') {
    throw new SemanticReleaseError(`config.projectId must be a string`);
  }

  if (!config.ticketPrefixes && !config.ticketRegex) {
    throw new SemanticReleaseError('Either config.ticketPrefixes or config.ticketRegex must be passed');
  }

  if (config.ticketPrefixes && config.ticketRegex) {
    throw new SemanticReleaseError(`config.ticketPrefixes and config.ticketRegex cannot be passed at the same time`);
  }

  if (config.ticketPrefixes) {
    if (!Array.isArray(config.ticketPrefixes)) {
      throw new SemanticReleaseError(`config.ticketPrefixes must be an array of string`);
    }
    for (const prefix of config.ticketPrefixes) {
      if (typeof prefix !== 'string') {
        throw new SemanticReleaseError(`config.ticketPrefixes must be an array of string`);
      }
    }
  }

  if (config.ticketRegex && typeof config.ticketRegex !== 'string') {
    throw new SemanticReleaseError(`config.ticketRegex must be an string`);
  }

  if (config.releaseNameTemplate) {
    if (typeof config.releaseNameTemplate !== 'string' || config.releaseNameTemplate!.indexOf('${version}') === -1) {
      throw new SemanticReleaseError('config.releaseNameTemplate must be a string containing ${version}');
    }
  }

  if (config.releaseDescriptionTemplate !== null && config.releaseDescriptionTemplate !== undefined) {
    if (typeof config.releaseDescriptionTemplate !== 'string') {
      throw new SemanticReleaseError('config.releaseDescriptionTemplate must be a string');
    }
  }

  if (networkConcurrency && (typeof networkConcurrency !== 'number' || networkConcurrency < 1)) {
    throw new SemanticReleaseError(`config.networkConcurrency must be an number greater than 0`);
  }

  if (!context.env.JIRA_AUTH) {
    throw new SemanticReleaseError(`JIRA_AUTH must be a string`);
  }
  const jira = makeClient(config, context);
  await jira.project.getProject({ projectIdOrKey: config.projectId });
}
