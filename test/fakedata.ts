import { BaseConfig, Person, Commit, PreviousRelease, UpcomingRelease, PluginConfig, PluginContext, GenerateNotesContext } from "../lib/types";

export const baseConfig: BaseConfig = {
  $0: '',
  branch: 'test',
  debug: true,
  dryRun: true,
}

export const date = new Date("2019-01-01T00:00:00.000Z")

export const author: Person = {
  name: 'test',
  email: 'email',
  date,
}

export const commits: Commit[] = [
  'chore: fixing whitespace',
  'docs: adding regex unescaping',
  'fix: escaping regex',
  'docs: [FIX-321] editing readme',
  'feat: [UH-1258] better logging ',
  'feat: [UH-1258] Implement release creation',
  'fix: [FIX-123] typescript config',
  'fix: [TEST-123] [TEST-234] test commit',
].map(m => ({
  author,
  committer: author,
  commitDate: date,
  body: '',
  hash: '',
  message: m,
  subject: '',
  commit: {
    long: '',
    short: ''
  }
}))

export const previousRelease: PreviousRelease = {
  gitHead: '',
  gitTag: '',
  version: ''
}

export const upcomingRelease: UpcomingRelease = {
  ...previousRelease,
  notes: '',
  type: ''
}

export const pluginConfig: Partial<PluginConfig> = {
  ...baseConfig,
  projectId: 'TEST',
  jiraHost: 'testjira.com'
}

export const logger = {
  info: jest.fn()
}

export const pluginContext: PluginContext = {
  cwd: '',
  env: {},
  logger: logger as any,
  options: baseConfig,
  stderr: null,
  stdout: null,
}
export const context: GenerateNotesContext = {
  ...pluginContext,
  commits,
  lastRelease: previousRelease,
  nextRelease: upcomingRelease
}
