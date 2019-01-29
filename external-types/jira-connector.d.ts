declare module 'jira-connector' {

  class JiraClient {
    public issue: JiraClient.IssueClient;
    public version: JiraClient.VersionClient;
    public project: JiraClient.ProjectClient;

    constructor (config: JiraClient.Config);
  }

  namespace JiraClient {
    interface Issue {}

    interface Project {
      id: string;
      key: string;
    }

    interface Version {
      self: string;
      id: string;
      name: string;
      archived: boolean;
      released: boolean;
      projectId: number;
    }

    interface IssueClient {
      getIssue (opts: {
        issueKey: string;
      }): Promise<Issue>;

      editIssue (opts: {
        issueKey: string;
        issue: {
          update: {
            fixVersions: {
              add: { id: string };
            }[];
          };
        };
      }): Promise<Issue>;
    }

    interface VersionClient {
      createVersion (opts: {
        version: {
          name: string;
          projectId: number | string;
          description?: string;
        };
      }): Promise<Version>;

      getVersion (opts: { versionId: string | number }): Promise<Version>;
    }

    interface ProjectClient {
      getProject (opts: { projectIdOrKey: string | string }): Promise<Project>;

      getVersions (opts: { projectIdOrKey: string | string }): Promise<Version[]>;
    }

    interface Config {
      host: string;
      basic_auth?: {
        base64: string;
      };
    }
  }

  export = JiraClient;
}
