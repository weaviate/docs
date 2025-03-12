RESET = '\x1b[0m';
RED = '\x1b[31m';
GRAY = '\x1b[90m';
GREEN = '\x1b[32m';

const validateLinks = async (paths, include_skipped=false) => {
    const LinkChecker = (await import('linkinator')).LinkChecker;
    const checker = new LinkChecker();
    
    // Print results for each checked link as we go
    checker.on('link', result => {

        if(result.state == 'SKIPPED') {
            if(include_skipped)
                console.log(GRAY+ `[---] ${result.url} -- ${result.state}` +RESET)
        } else if(result.state == 'BROKEN') {
            console.log(RED+ `[${result.status}] ${result.url} -- ${result.state}` +RESET)
        } else {
            console.log(`[${result.status}] ${result.url} -- ${result.state}` )
        }
    });
    
    let results = [];
    
    for(let i=0; i<paths.length; i++) {
        let path = paths[i];

        // check links and save results for later
        let result = await runChecker(checker, path);
        result.startingPath = path;

        results.push(result);

    }

    console.log('>>> FINISHED CHECKING LINKS')

    return results;
}

const runChecker = async (checker, startingPath) => {
    console.log(`**************************************************************`)
    console.log(`Checking Links for ${startingPath}`)
    console.log(`**************************************************************`)

    return await checker.check({
        path: startingPath,
        recurse: true,
        retry: true,
        retryErrors: true,
        retryErrorsCount: 2,
        retryErrorsJitter: 5,
        timeout: 5000,
        linksToSkip: [
            //URL_IGNORES
            'https://x.com',
            'https://openai.com',
            'https://platform.openai.com',
            'https://aistudio.google.com',
            'https://ai.google.dev',
            'https://www.snowflake.com',
            'https://www.researchgate.net',
            'https://ai.meta.com/',
            'https://voyageai.com/',
            'https://simple/',
            //DOCUSAURUS_IGNORES
            'github.com/weaviate/docs',
            //WEAVIATE_LINKS_TO_IGNORE
            'https://weaviate-docs.netlify.app/docs/',

            //TEMP
            'https://youtu.be/',
            'https://www.youtube.com',
        ]
    });
}

const printSummary = (result) => {
    // SUMMARY
    const skippedLinks = result.links.filter(x => x.state === 'SKIPPED');
    let brokeLinks = result.links.filter(x => x.state === 'BROKEN');

    console.log(`-----------------------------------------------------------------------
SUMMARY FOR:       ${result.startingPath}
${(result.passed)? GREEN : RED}Validation Passed: ${result.passed}${RESET}
Links found:       ${result.links.length}
Broken links:      ${brokeLinks.length}
Checked links:     ${result.links.length - skippedLinks.length}
Skipped links:     ${skippedLinks.length}
`)


    brokeLinks = brokeLinks.map(link => {
        let lastFailureDetails = link.failureDetails[link.failureDetails.length-1]

        return prettyLink = {
            parent: link.parent,
            url: link.url,
            status: link.status,
            // get either statusText or message from the last failure object
            statusText: lastFailureDetails.statusText || lastFailureDetails.message,
        }
    })

    if(brokeLinks.length > 0) {
        console.log(RED + '----- BROKEN LINKS: -----' + RESET)

        // print links info in red
        console.log(JSON.stringify(brokeLinks, null, 2));
        // console.log(JSON.stringify(prettyLink, null, 2));
    }

}

const findNetlifyPath = () => {
    const fs = require('fs');
    const netlifyOut = fs.readFileSync('netlify.out', { encoding: 'utf8' });

    const neflityLines = netlifyOut.split('\n');
    const draftLine = neflityLines.find(line => line.includes('Website draft URL'))
    const neflityUrl = draftLine.match('https://.*')[0];

    return neflityUrl;
}

const runLinkValidation = async () => {
    const netlifyPath = findNetlifyPath();

    const paths = [
        `${netlifyPath}/docs/agents`,
        `${netlifyPath}/docs/cloud`,
        `${netlifyPath}/docs/integrations/`,
        `${netlifyPath}/docs/weaviate`,
    ]

    const results = await validateLinks(paths);

    let allLinksFine = true;
    results.forEach(result => {
        printSummary(result)

        allLinksFine &&= result.passed
    })

    return allLinksFine;
}

runLinkValidation()
.then(
    passed => {
        console.log(`Passed: ${passed}`);
        if (passed) {
            // Force exit, as sometimes linkinator doesn't quit the process and it hangs
            process.exit(0)
        }
        // Throw an error if any of the links are broken
        process.exit(1)
    }
)
