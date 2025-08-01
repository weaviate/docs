const { LinkValidator, Verbosity, domainsToIgnore } = require('./link-validator')

const runPRValidationFromBuildDev = async () => {
    const validator = new LinkValidator({
        directoryListing: true,
        serverRoot: './build.dev', // <<< run link validation from the build.dev folder
        
        // Run link checker at port 9000, and update all local.build.dev
        port: 9000,
        urlRewriteExpressions: [
            {   // update the dev config.url to run on localhost:9000
                pattern: 'http://localhost.build.dev',
                replacement: 'http://localhost:9000',
            },
            {   // make sure to validate weaviate.io docs locally
                pattern: 'https://docs.weaviate.io',
                replacement: 'http://localhost:9000',
            }
        ],

        linksToSkip: [
            //SHARED_DOMAINS_IGNORES
            ...domainsToIgnore,

            // GITHUB_IGNORES
            'github.com',

            // SPECIFIC_IGNORES
            'https://console.cloud.google.com/marketplace/product/weaviate-gcp-mktplace/weaviate?inv=1&invt=AbwjlA',

            //IGNORE assets - these are safe, as they are generated by docusaurus
            /assets\/(css|js|files|fonts|images)/,
        ]
    }, Verbosity.ERROR);
    
    const paths = [
        `/agents`,
        `/cloud`,
        `/integrations/`,
        `/weaviate`,
    ]
    
    const success = await validator.validateLinks(paths);
    validator.printSummary();
    
    return success;
}

runPRValidationFromBuildDev()
.then(
    passed => {
        if (passed) {
            // Force exit, as sometimes linkinator doesn't quit the process and it hangs
            process.exit(0)
        }

        // Throw an error if any of the links are broken
        process.exit(1)
    }
)
