/**
 * The supported Weaviate Database minor versions, each with its latest patch,
 * and the newest minor version that is no longer maintained.
 *
 * Usage in MDX:
 *   import SupportedVersionsTable from '@site/src/components/SupportedVersionsTable';
 *   <SupportedVersionsTable />
 *
 * Rows come from `weaviate_recent_versions` in versions-config.json, which
 * _build_scripts/update-config-versions.js sets at build time to the latest
 * patch of each of the three newest minor versions, newest first. Local builds
 * use the checked-in fallback values.
 */
import React from 'react';
import versionsConfig from '@site/versions-config.json';

const RELEASES_URL = 'https://github.com/weaviate/weaviate/releases/tag';

const minorOf = (version) => version.split('.').slice(0, 2).join('.');

export default function SupportedVersionsTable() {
  const versions = versionsConfig.weaviate_recent_versions;
  const [major, oldestMinor] = minorOf(versions[versions.length - 1]).split('.');
  const unmaintained = `${major}.${Number(oldestMinor) - 1}`;

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Minor version</th>
            <th>Latest patch</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {versions.map((version, index) => (
            <tr key={version}>
              <td><code>{minorOf(version)}</code></td>
              <td><a href={`${RELEASES_URL}/v${version}`}><code>{`v${version}`}</code></a></td>
              <td>{index === 0 ? 'Latest release' : 'Supported'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        <code>{unmaintained}</code> and older are no longer maintained. Upgrade to a supported version.
      </p>
    </>
  );
}
