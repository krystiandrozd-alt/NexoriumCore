// Nexorium Core - Connector Preview Sources
// Maps a file-based connector type and a source path to connector options.
// Uses Node built-ins only, so command-line tools can validate input before loading connectors.

import * as fs from 'fs';
import * as path from 'path';

/** File-based connector types that can be previewed. The mock connector has no source to check. */
export const PREVIEW_CONNECTOR_TYPES = [
  'config-repo',
  'terraform',
  'cloud-aws',
  'cloud-azure',
  'cloud-gcp',
  'csv',
] as const;

export type PreviewConnectorType = (typeof PREVIEW_CONNECTOR_TYPES)[number];

/** Files the csv connector reads from a source directory, keyed by connector option. */
export const CSV_SOURCE_FILES = {
  hostsPath: 'hosts.csv',
  componentsPath: 'components.csv',
  instancesPath: 'instances.csv',
  endpointsPath: 'endpoints.csv',
  versionsPath: 'versions.csv',
  connectionsPath: 'connections.csv',
} as const;

/** Extensions the config-repo connector reads from a manifest directory. */
const MANIFEST_EXTENSIONS = ['.yaml', '.yml', '.json'] as const;

/** The source is missing, unreadable, or not the kind of path the connector type expects. */
export class PreviewSourceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PreviewSourceError';
  }
}

export interface ResolvedPreviewSource {
  /** Options for createConnectorV2(). */
  options: Record<string, string>;
  /** Files the connector reads, relative to the caller when the source is relative. Sorted. */
  files: string[];
}

function statSource(source: string): fs.Stats {
  try {
    return fs.statSync(source);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') {
      throw new PreviewSourceError(`Source not found: ${source}`);
    }
    throw new PreviewSourceError(`Source cannot be read: ${source} (${code ?? String(error)})`);
  }
}

function assertReadable(target: string): void {
  try {
    fs.accessSync(target, fs.constants.R_OK);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    throw new PreviewSourceError(`Source cannot be read: ${target} (${code ?? String(error)})`);
  }
}

function requireFile(type: PreviewConnectorType, source: string, stat: fs.Stats, expected: string): void {
  if (!stat.isFile()) {
    throw new PreviewSourceError(`${type} expects ${expected}, but ${source} is not a file.`);
  }
  assertReadable(source);
}

/**
 * Validates the source for a connector type and returns the connector options.
 * Throws PreviewSourceError when the source cannot be used.
 */
export function resolvePreviewSource(type: PreviewConnectorType, source: string): ResolvedPreviewSource {
  const stat = statSource(source);

  switch (type) {
    case 'config-repo': {
      if (stat.isFile()) {
        assertReadable(source);
        return { options: { manifestPath: source }, files: [source] };
      }
      if (!stat.isDirectory()) {
        throw new PreviewSourceError(`config-repo expects a manifest file or directory, but ${source} is neither.`);
      }
      assertReadable(source);
      const files = fs.readdirSync(source)
        .filter((name) => MANIFEST_EXTENSIONS.some((ext) => name.endsWith(ext)))
        .sort()
        .map((name) => path.join(source, name));
      if (files.length === 0) {
        throw new PreviewSourceError(
          `Directory ${source} contains no ${MANIFEST_EXTENSIONS.join(', ')} manifest files. The config-repo connector does not read subdirectories.`);
      }
      return { options: { manifestPath: source }, files };
    }

    case 'terraform':
      requireFile(type, source, stat, 'a Terraform state file');
      return { options: { statePath: source }, files: [source] };

    case 'cloud-aws':
    case 'cloud-azure':
    case 'cloud-gcp':
      requireFile(type, source, stat, 'a control-plane fixture file');
      return { options: { fixturePath: source }, files: [source] };

    case 'csv': {
      if (!stat.isDirectory()) {
        throw new PreviewSourceError(
          `csv expects a directory holding ${Object.values(CSV_SOURCE_FILES).join(', ')}, but ${source} is not a directory.`);
      }
      const options: Record<string, string> = {};
      const files: string[] = [];
      for (const [option, name] of Object.entries(CSV_SOURCE_FILES)) {
        const filePath = path.join(source, name);
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          assertReadable(filePath);
          options[option] = filePath;
          files.push(filePath);
        }
      }
      if (files.length === 0) {
        throw new PreviewSourceError(
          `Directory ${source} contains none of: ${Object.values(CSV_SOURCE_FILES).join(', ')}.`);
      }
      return { options, files: files.sort() };
    }
  }
}
