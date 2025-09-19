// const fetch = require('node-fetch');

const getRepoVersion = async (repoName) => {
    try {
        console.log(`\n=== Fetching ${repoName} at ${new Date().toISOString()} ===`);

        (process.env.GH_API_TOKEN)

        const fetch = (await import('node-fetch')).default;
        const response = await fetch( // fetch all release versions
            `https://api.github.com/repos/weaviate/${repoName}/releases`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'request',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                    'If-None-Match': '', // Bypass ETag caching
                    'authorization': // Use the github token if available
                        (process.env.GH_API_TOKEN) ?
                            `Bearer ${ process.env.GH_API_TOKEN }` : ''
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

        console.log(`Total releases found: ${releases.length}`);

        // Log ALL raw releases with their prerelease status
        const allReleaseInfo = releases.map(item => ({
            tag: item.tag_name,
            prerelease: item.prerelease,
            published_at: item.published_at,
            draft: item.draft
        }));
        console.log(`${repoName} - ALL raw releases:`, JSON.stringify(allReleaseInfo, null, 2));

        if (releases.length === 0) {
            throw new Error(`No releases found for ${repoName}`);
        }

        const filteredReleases = releases
            .filter(item => !item.prerelease) // remove pre-release items
            .map(item => item.tag_name);       // keep only the tag_name

        console.log(`${repoName} - All non-prerelease versions:`, filteredReleases);

        const highestVersion = releases
            .filter(item => !item.prerelease) // remove pre-release items
            .map(item => item.tag_name)       // keep only the tag_name
            .sort()                           // sort items alphabetically – ascending
            .pop()                            // the last item contains the highest version (what we need)
            .replace('v', '')                 // remove the v from the name "v1.26.1" => "1.26.1"

        console.log(`${repoName} ${highestVersion}`);
        return highestVersion;
    } catch (error) {
        console.error(`Error fetching version for ${repoName}:`, error);
        // Maybe return a default version or rethrow depending on your needs
        throw error;
    }
}

// Build time versions replace values set in versions-config.json
// versions-config.json values are used for yarn local yarn builds
const appendVersionsToConfig = async (config) => {
    config.weaviate_version = await getRepoVersion('weaviate');
    config.python_client_version = await getRepoVersion('weaviate-python-client');
    config.go_client_version = await getRepoVersion('weaviate-go-client');
    config.java_client_version = await getRepoVersion('weaviate-java-client');
    // config.javascript_client_version = await getRepoVersion('weaviate-javascript-client');
    config.typescript_client_version = await getRepoVersion('typescript-client');
    config.helm_version = await getRepoVersion('weaviate-helm');
    config.weaviate_cli_version = await getRepoVersion('weaviate-cli');

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
