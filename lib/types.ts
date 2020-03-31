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

export interface PluginConfig extends BaseConfig {
  ticketPrefixes?: string[];
  ticketRegex?: string;
  projectId: number;
  releaseNameTemplate?: string;
  jiraHost: string;
  networkConcurrency?: number;

  released?: boolean;
  setReleaseDate?: boolean;
}
