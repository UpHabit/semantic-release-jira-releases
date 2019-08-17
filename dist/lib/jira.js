"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jira_connector_1 = __importDefault(require("jira-connector"));
function makeClient(config, context) {
    return new jira_connector_1.default({
        host: config.jiraHost,
        port: config.jiraPort,
        protocol: config.jiraProtocol,
        basic_auth: {
            base64: context.env.JIRA_AUTH,
        },
    });
}
exports.makeClient = makeClient;
