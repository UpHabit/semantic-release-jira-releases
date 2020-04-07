import JiraClient, { Version } from 'jira-connector';
import * as _ from 'lodash';
import pLimit from 'p-limit';

import { makeClient } from './jira';
import { DEFAULT_RELEASE_DESCRIPTION_TEMPLATE, DEFAULT_VERSION_TEMPLATE, GenerateNotesContext, PluginConfig } from './types';
import { escapeRegExp } from './util';

export function getTickets(config: PluginConfig, context: GenerateNotesContext): string[] {
  let patterns: RegExp[] = [];

  if (config.ticketRegex !== undefined) {
    patterns = [new RegExp(config.ticketRegex, 'giu')];
  } else {
    patterns = config.ticketPrefixes!
        .map(prefix => new RegExp(`\\b${escapeRegExp(prefix)}-(\\d+)\\b`, 'giu'));
  }

  const tickets = new Set<string>();
  for (const commit of context.commits) {
    for (const pattern of patterns) {
      const matches = commit.message.match(pattern);
      if (matches) {
        matches.forEach(match => {
          tickets.add(match);
          context.logger.info(`Found ticket ${matches} in commit: ${commit.commit.short}`);
        });
      }
    }
  }

  return [...tickets];
}

async function findOrCreateVersion(config: PluginConfig, context: GenerateNotesContext, jira: JiraClient, projectIdOrKey: string, name: string, description: string): Promise<Version> {
  const remoteVersions = await jira.project.getVersions({ projectIdOrKey });
  context.logger.info(`Looking for version with name '${name}'`);
  const existing = _.find(remoteVersions, { name });
  if (existing) {
    context.logger.info(`Found existing release '${existing.id}'`);
    return existing;
  }

  context.logger.info(`No existing release found, creating new`);

  let newVersion: Version;
  if (config.dryRun) {
    context.logger.info(`dry-run: making a fake release`);
    newVersion = {
      name,
      id: 'dry_run_id',
    } as any;
  } else {
    const descriptionText = description || '';
    newVersion = await jira.version.createVersion({
      name,
      projectId: projectIdOrKey as any,
      description: descriptionText,
      released: Boolean(config.released),
      releaseDate: config.setReleaseDate ? (new Date().toISOString()) : undefined,
    });
  }

  context.logger.info(`Made new release '${newVersion.id}'`);
  return newVersion;
}

async function editIssueFixVersions(config: PluginConfig, context: GenerateNotesContext, jira: JiraClient, newVersionName: string, releaseVersionId: string, issueKey: string): Promise<void> {
  try {
    context.logger.info(`Adding issue ${issueKey} to '${newVersionName}'`);
    if (!config.dryRun) {
      await jira.issue.editIssue({
        issueKey,
        issue: {
          update: {
            fixVersions: [{
              add: { id: releaseVersionId },
            }],
          },
          properties: undefined as any,
        },
      });
    }
  } catch (err) {
    const allowedStatusCodes = [400, 404];
    let { statusCode } = err;
    if (typeof err === 'string') {
      try {
        err = JSON.parse(err);
        statusCode = statusCode || err.statusCode;
      } catch (err) {
          // it's not json :shrug:
      }
    }
    if (allowedStatusCodes.indexOf(statusCode) === -1) {
      throw err;
    }
    context.logger.error(`Unable to update issue ${issueKey} statusCode: ${statusCode}`);
  }
}

export async function success(config: PluginConfig, context: GenerateNotesContext): Promise<void> {
  const tickets = getTickets(config, context);

  context.logger.info(`Found ticket ${tickets.join(', ')}`);

  const versionTemplate = _.template(config.releaseNameTemplate ?? DEFAULT_VERSION_TEMPLATE);
  const newVersionName = versionTemplate({ version: context.nextRelease.version });

  const descriptionTemplate = _.template(config.releaseDescriptionTemplate ?? DEFAULT_RELEASE_DESCRIPTION_TEMPLATE);
  const newVersionDescription = descriptionTemplate({ version: context.nextRelease.version, notes: context.nextRelease.notes });

  context.logger.info(`Using jira release '${newVersionName}'`);

  const jira = makeClient(config, context);

  const project = await jira.project.getProject({ projectIdOrKey: config.projectId });
  const releaseVersion = await findOrCreateVersion(config, context, jira, project.id, newVersionName, newVersionDescription);

  const concurrentLimit = pLimit(config.networkConcurrency || 10);

  const edits = tickets.map(issueKey =>
    concurrentLimit(() =>
      editIssueFixVersions(config, context, jira, newVersionName, releaseVersion.id, issueKey),
    ),
  );

  await Promise.all(edits);
}
