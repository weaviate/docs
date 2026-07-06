// const fetch = require('node-fetch');

const MAX_ATTEMPTS = 5;

// Fetch a repo's releases as an ascending, semver-sorted array of version
// strings (v-prefix stripped), excluding pre-releases and drafts. Shared by
// getRepoVersion (single highest) and getRecentMinorVersions (top-N minors).
// Keeps the original retry/backoff on failure.
const fetchReleaseVersions = async (repoName, perPage = 100, attempt = 1) => {
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch( // fetch release versions
            `https://api.github.com/repos/weaviate/${repoName}/releases?per_page=${perPage}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'request',
                    'authorization': // Use the github token if available
                        (process.env.GH_API_TOKEN) ?
                            `Bearer ${process.env.GH_API_TOKEN}` : ''
                }
            }
        );

        // First check if the response was ok
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }

        const releases = await response.json();

        // Check if releases is actually an array
        if (!Array.isArray(releases)) {
            // Debug log to see what we're getting
            console.log(`Raw response for ${repoName}:`, JSON.stringify(releases).slice(0, 200));
            console.error(`Unexpected response format for ${repoName}:`, releases);
            throw new Error(`Expected array of releases but got ${typeof releases}`);
        }

        if (releases.length === 0) {
            throw new Error(`No releases found for ${repoName}`);
        }

        return releases
            .filter(item => !item.prerelease)        // remove pre-release items
            .filter(item => !item.draft)             // remove draft releases
            .map(item => item.tag_name.replace('v', '')) // strip the v: "v1.26.1" => "1.26.1"
            .sort((a, b) =>                          // semver-aware sort – ascending
                a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
    } catch (error) {
        if (attempt < MAX_ATTEMPTS) {
            const delay = 1000 * 2 ** (attempt - 1); // 1s, 2s
            console.warn(`[${repoName}] attempt ${attempt} failed (${error.message}); retrying in ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchReleaseVersions(repoName, perPage, attempt + 1);
        }
        console.error(`Error fetching versions for ${repoName} after ${MAX_ATTEMPTS} attempts:`, error);
        throw error;
    }
}

// Highest non-prerelease version for a repo (behavior unchanged).
const getRepoVersion = async (repoName) => {
    const highestVersion = (await fetchReleaseVersions(repoName)).pop();
    console.log(`${repoName} ${highestVersion}`);
    return highestVersion;
}

// Latest patch of each of the most recent `count` MINOR versions, newest first,
// e.g. ["1.38.2", "1.37.11", "1.36.19"]. Uses per_page=100 so the window spans
// at least a few minors.
const getRecentMinorVersions = async (repoName, count) => {
    const versions = await fetchReleaseVersions(repoName, 100); // ascending
    const latestByMinor = new Map();
    for (const v of versions) {
        const [major, minor] = v.split('.');
        if (major === undefined || minor === undefined) continue;
        const minorKey = `${major}.${minor}`;
        const existing = latestByMinor.get(minorKey);
        if (!existing ||
            v.localeCompare(existing, undefined, { numeric: true, sensitivity: 'base' }) > 0) {
            latestByMinor.set(minorKey, v); // keep the highest patch per minor
        }
    }
    return Array.from(latestByMinor.keys())
        .sort((a, b) =>                      // minors newest first
            b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' }))
        .slice(0, count)
        .map(minorKey => latestByMinor.get(minorKey));
}

// Build time versions replace values set in versions-config.json
// versions-config.json values are used for yarn local yarn builds
const appendVersionsToConfig = async (config) => {
    config.weaviate_version = await getRepoVersion('weaviate');
    config.weaviate_recent_versions = await getRecentMinorVersions('weaviate', 3);
    config.python_client_version = await getRepoVersion('weaviate-python-client');
    config.go_client_version = await getRepoVersion('weaviate-go-client');
    config.java_client_version = await getRepoVersion('weaviate-java-client');
    config.typescript_client_version = await getRepoVersion('typescript-client');
    config.helm_version = await getRepoVersion('weaviate-helm');
    config.weaviate_cli_version = await getRepoVersion('weaviate-cli');
    config.agents_python_version = await getRepoVersion('weaviate-agents-python-client');
    config.agents_typescript_version = await getRepoVersion('agents-typescript-client');

    config.spark_connector_version = await getRepoVersion('spark-connector');
}

const fs = require('fs');
const readConfig = (path) => {
    const data = fs.readFileSync(path);
    return JSON.parse(data);
}

const updateConfigFile = async () => {
    const path = './versions-config.json';

    const config = readConfig(path);

    await appendVersionsToConfig(config);

    fs.writeFile(path, JSON.stringify(config, null, 2), (err) => {
        if (err) return console.log(err);

        console.log(`Updating ${path}`)
        console.log(JSON.stringify(config, null, 2));
    });
}

updateConfigFile();
