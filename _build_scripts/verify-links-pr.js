const { LinkValidator, Verbosity, Color } = require('./link-validator')

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
                pattern: 'https://weaviate-docs.netlify.app/docs',
                // pattern: 'http://weaviate.io/docs', // TODO: update the link to weaviate.io
                replacement: 'http://localhost:9000/docs',
            }
        ],

        linksToSkip: [
            //URL_IGNORES
            'https://openai.com',
            'https://platform.openai.com',
            'https://aistudio.google.com',
            'https://ai.google.dev',
            'https://www.snowflake.com',
            'https://www.researchgate.net',
            'https://ai.meta.com/',
            'https://voyageai.com/',
            'https://simple/',
            // GITHUB_IGNORES
            'github.com',
            //DEV_BUILD_LINKS_TO_IGNORE
            'assets/files',

            //SKIP YOUTUBE
            'https://youtu.be/',
            'https://www.youtube.com',
        ]
    }, Verbosity.INFO);
    
    const paths = [
        `/docs/agents`,
        `/docs/cloud`,
        `/docs/integrations/`,
        `/docs/weaviate`,
    ]
    
    const results = await validator.validateLinks(paths);
    
    let allLinksFine = true;
    results.forEach(result => {
        validator.printSummary(result)

        allLinksFine &&= result.passed
    })

    return allLinksFine;
}

runPRValidationFromBuildDev()
.then(
    passed => {
        if (passed) {

        console.log(`
${Color.GREEN}##################################
${Color.GREEN}# WEBSITE LINK VALIDATION PASSED #
${Color.GREEN}##################################`);
            // Force exit, as sometimes linkinator doesn't quit the process and it hangs
            process.exit(0)
        }

        console.log(`
${Color.RED}##################################
${Color.RED}# WEBSITE LINK VALIDATION FAILED #
${Color.RED}##################################`);

        // Throw an error if any of the links are broken
        process.exit(1)
    }
)
