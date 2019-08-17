"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = __importStar(require("lodash"));
const jira_1 = require("./jira");
const util_1 = require("./util");
function getTickets(config, context) {
    let patterns = [];
    if (config.ticketRegex !== undefined) {
        patterns = [new RegExp(config.ticketRegex, 'giu')];
    }
    else {
        patterns = config.ticketPrefixes
            .map(prefix => new RegExp(`\\b${util_1.escapeRegExp(prefix)}-(\\d+)\\b`, 'giu'));
    }
    const tickets = new Set();
    for (const commit of context.commits) {
        for (const pattern of patterns) {
            const matches = commit.message.match(pattern);
            if (matches) {
                tickets.add(matches[0]);
                context.logger.info(`Found ticket ${matches[0]} in commit: ${commit.commit.short}`);
            }
        }
    }
    return [...tickets];
}
exports.getTickets = getTickets;
async function findOrCreateVersion(config, context, jira, projectIdOrKey, name) {
    const remoteVersions = await jira.project.getVersions({ projectIdOrKey });
    context.logger.info(`Looking for version with name '${name}'`);
    const existing = _.find(remoteVersions, { name });
    if (existing) {
        context.logger.info(`Found existing release '${existing.id}'`);
        return existing;
    }
    context.logger.info(`No existing release found, creating new`);
    let newVersion;
    if (config.dryRun) {
        context.logger.info(`dry-run: making a fake release`);
        newVersion = {
            name,
            id: 'dry_run_id',
        };
    }
    else {
        newVersion = await jira.version.createVersion({
            version: {
                name,
                projectId: projectIdOrKey,
            },
        });
    }
    context.logger.info(`Made new release '${newVersion.id}'`);
    return newVersion;
}
async function success(config, context) {
    const tickets = getTickets(config, context);
    context.logger.info(`Found ticket ${tickets.join(', ')}`);
    const template = _.template(config.releaseNameTemplate || 'v${version}');
    const newVersionName = template({ version: context.nextRelease.version });
    context.logger.info(`Using jira release '${newVersionName}'`);
    const jira = jira_1.makeClient(config, context);
    const project = await jira.project.getProject({ projectIdOrKey: config.projectId });
    const releaseVersion = await findOrCreateVersion(config, context, jira, project.id, newVersionName);
    for (const issueKey of tickets) {
        try {
            context.logger.info(`Adding issue ${issueKey} to '${newVersionName}'`);
            if (!config.dryRun) {
                await jira.issue.editIssue({
                    issueKey,
                    issue: {
                        update: {
                            fixVersions: [{
                                    add: { id: releaseVersion.id },
                                }],
                        },
                    },
                });
            }
        }
        catch (err) {
            const allowedStatusCodes = [400, 404];
            let { statusCode } = err;
            if (typeof err === 'string') {
                try {
                    err = JSON.parse(err);
                    statusCode = statusCode || err.statusCode;
                }
                catch (err) {
                    // it's not json :shrug:
                }
            }
            if (allowedStatusCodes.indexOf(statusCode) === -1) {
                throw err;
            }
            context.logger.error(`Unable to update issue ${issueKey} statusCode: ${statusCode}`);
        }
    }
}
exports.success = success;
