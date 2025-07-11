const { LinkValidator, Verbosity, domainsToIgnore } = require('./link-validator')

const findNetlifyPath = () => {
    const fs = require('fs');
    const netlifyOut = fs.readFileSync('netlify.out', { encoding: 'utf8' });

    const neflityLines = netlifyOut.split('\n');
    const draftLine = neflityLines.find(line => line.includes('Website draft URL'))
    const neflityUrl = draftLine.match('https://.*')[0];

    return neflityUrl;
}

const runBranchValidationOnNetlify = async () => {
    const netlifyPath = findNetlifyPath();

    const validator = new LinkValidator({
        urlRewriteExpressions: [
            {
                pattern: 'https://docs.weaviate.io',
                replacement: `${netlifyPath}/docs`,
            },
            {
                pattern: 'https://docs.weaviate.io/og',
                replacement: `${netlifyPath}/og`,
            },
        ],

        linksToSkip: [
            //URL_IGNORES
            ...domainsToIgnore,

            //DOCUSAURUS_IGNORES
            'github.com/weaviate/docs',
        ]
    }, Verbosity.ERROR)
    
    const paths = [
        `${netlifyPath}/agents`,
        `${netlifyPath}/cloud`,
        `${netlifyPath}/integrations/`,
        `${netlifyPath}/weaviate`,
    ]
    
    const success = await validator.validateLinks(paths);
    validator.printSummary();
    
    return success;
}

try {
    runBranchValidationOnNetlify()
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
} catch(error) {
    console.error(`runBranchValidationOnNetlify failed`)
    console.error(error)
}
