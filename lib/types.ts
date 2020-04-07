import { Signale } from 'signale';

export interface PluginContext {
  cwd: string;
  env: {
    [k: string]: string;
  };
  logger: Signale;
  options: BaseConfig;
  stderr: typeof process.stderr;
  stdout: typeof process.stdout;
}

export interface Person {
  name: string;
  email: string;
  date: Date;
}

export interface Commit {
  author: Person;
  committer: Person;
  commitDate: Date;
  body: string;
  hash: string;
  message: string;
  subject: string;
  commit: {
    long: string;
    short: string;
  };
}

export interface PreviousRelease {
  gitHead: string;
  gitTag: string;
  version: string;
}

export interface UpcomingRelease extends PreviousRelease {
  notes: string;
  type: string;
}

export interface GenerateNotesContext extends PluginContext {
  commits: Commit[];
  lastRelease: PreviousRelease;
  nextRelease: UpcomingRelease;
}

export interface BaseConfig {
  $0: string;
  branch: string;
  debug: boolean;
  dryRun: boolean;
}

export const DEFAULT_VERSION_TEMPLATE = 'v${version}';
export const DEFAULT_RELEASE_DESCRIPTION_TEMPLATE = 'Automated release with semantic-release-jira-releases https://git.io/JvAbj';

export interface PluginConfig extends BaseConfig {
  /**
   * A domain of a jira instance ie: `uphabit.atlasian.net`
   */
  jiraHost: string;

  /**
   * A list of prefixes to match when looking for tickets in commits. Cannot be used together with ticketRegex.
   *
   * ie. ['TEST'] would match `TEST-123` and `TEST-456`
   */
  ticketPrefixes?: string[];

  /**
   * A unescaped regex to match tickets in commits (without slashes). Cannot be used together with ticketPrefixes.
   *
   * ie. [a-zA-Z]{4}-\d{3,5} would match any ticket with 3 letters a dash and 3 to 5 numbers, such as `TEST-456`, `TEST-5643` and `TEST-56432`
   */
  ticketRegex?: string;

  /**
   * The id or key for the project releases will be created in
   */
  projectId: string;

  /**
   * A lodash template with a single `version` variable
   * defaults to `v${version}` which results in a version that is named like `v1.0.0`
   * ex: `Semantic Release v${version}` results in `Semantic Release v1.0.0`
   *
   * @default `v${version}`
   */
  releaseNameTemplate?: string;

  /**
   * A lodash template for the release.description field
   *
   * template variables:
   *    version: the sem-ver version ex.: 1.2.3
   *      notes: The full release notes: This may be very large
   *             Only use it if you have very small releases
   *
   * @default `Automated release with semantic-release-jira-releases https://git.io/JvAbj`
   */
  releaseDescriptionTemplate?: string;

  /**
   * The number of maximum parallel network calls, default 10
   */
  networkConcurrency?: number;

  /**
   * indicates if a new release created in jira should be set as released
   */
  released?: boolean;
  /**
   * include the release date when creating a release in jira
   */
  setReleaseDate?: boolean;
}
