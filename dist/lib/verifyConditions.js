"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = __importDefault(require("@semantic-release/error"));
const jira_1 = require("./jira");
async function verifyConditions(config, context) {
    if (typeof config.jiraHost !== 'string') {
        throw new error_1.default(`config.jiraHost must be a string`);
    }
    if (typeof config.projectId !== 'string') {
        throw new error_1.default(`config.projectId must be a string`);
    }
    if (!config.ticketPrefixes && !config.ticketRegex) {
        throw new error_1.default('Either config.ticketPrefixes or config.ticketRegex must be passed');
    }
    if (config.ticketPrefixes && config.ticketRegex) {
        throw new error_1.default(`config.ticketPrefixes and config.ticketRegex cannot be passed at the same time`);
    }
    if (config.ticketPrefixes) {
        if (!Array.isArray(config.ticketPrefixes)) {
            throw new error_1.default(`config.ticketPrefixes must be an array of string`);
        }
        for (const prefix of config.ticketPrefixes) {
            if (typeof prefix !== 'string') {
                throw new error_1.default(`config.ticketPrefixes must be an array of string`);
            }
        }
    }
    if (config.ticketRegex && typeof config.ticketRegex !== 'string') {
        throw new error_1.default(`config.ticketRegex must be an string`);
    }
    if (config.releaseNameTemplate) {
        if (typeof config.releaseNameTemplate !== 'string' || config.releaseNameTemplate.indexOf('${version}') === -1) {
            throw new error_1.default('config.releaseNameTemplate must be a string containing ${version}');
        }
    }
    if (!context.env.JIRA_AUTH) {
        throw new error_1.default(`JIRA_AUTH must be a string`);
    }
    if (config.jiraPort && typeof config.jiraPort !== 'number') {
        throw new error_1.default('config.jiraPort must be a number.');
    }
    if (config.jiraProtocol && typeof config.jiraProtocol !== 'string') {
        throw new error_1.default('config.jiraProtocol must be a string.');
    }
    const jira = jira_1.makeClient(config, context);
    await jira.project.getProject({ projectIdOrKey: config.projectId });
}
exports.verifyConditions = verifyConditions;
