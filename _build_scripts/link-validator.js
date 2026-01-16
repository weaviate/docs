class Color {
    static #_RESET = '\x1b[0m';
    static #_GRAY = '\x1b[90m';
    static #_RED = '\x1b[31m';
    static #_GREEN = '\x1b[32m';
    static #_BLUE = '\x1b[44m';

    static get RESET() { return this.#_RESET; }
    static get GRAY() { return this.#_GRAY; }
    static get RED() { return this.#_RED; }
    static get GREEN() { return this.#_GREEN; }
    static get BLUE() { return this.#_BLUE; }
}

class Verbosity {
    static #_ERROR = 0;
    static #_INFO = 1;
    static #_ALL_LINKS = 2;

    static get ERROR() { return this.#_ERROR; }
    static get INFO() { return this.#_INFO; }
    static get ALL_LINKS() { return this.#_ALL_LINKS; }
}

const domainsToIgnore = [
    'https://aistudio.google.com',
    'https://ai.google.dev',
    'https://ai.meta.com/',
    'https://www.anthropic.com',
    'https://console.anthropic.com',
    'https://www.computerhope.com',
    'https://console.x.ai/',
    'https://console.cloud.google.com',
    'https://docs.anthropic.com',
    'https://docs.x.ai',
    'https://dspy.ai/', // TODO[g-despot]: only temporarily added until we can fix the link
    'https://github.com', // TODO[g-despot]: started throwing Too Many Requests 429
    'https://instagram.com/',
    'https://medium.com/', // TODO[g-despot]: started throwing Forbidden 403
    'https://www.npmjs.com',
    'https://openai.com',
    'https://platform.openai.com',
    'https://www.researchgate.net',
    'https://simple/',
    'https://www.snowflake.com',
    'https://stackoverflow.com/',
    'https://towardsdatascience.com/',
    'https://voyageai.com/',
    'https://weaviateagents.featurebase.app',
    'https://weaviate-docs.mcp.kapa.ai/',
    'https://youtu.be/',
    'https://www.youtube.com',
    'https://x.com',
]

class LinkValidator {
    #checker;
    #verbosity;
    #linkinatorOptions = {
        recurse: true,
        retry: true,
        retryErrors: true,
        retryErrorsCount: 2,
        retryErrorsJitter: 5,
        timeout: 5000,
    }

    #validationResults;
    #validationSuccess = true;
    get results() { return this.#validationResults}

    constructor(linkinatorOptions, verbosity=Verbosity.ERROR) {
        this.#verbosity = verbosity;

        // Copy/override user provided options into the defaults linkinatorOptions
        Object.assign(this.#linkinatorOptions, linkinatorOptions)
    }

    async #prepareLinkChecker() {
        // don't create the link checker if we already have one
        if(this.#checker) return

        const LinkChecker = (await import('linkinator')).LinkChecker;
        this.#checker = new LinkChecker();

        // Print results for each checked link as we go
        this.#checker.on('link', result => {
            if(result.state == 'BROKEN') {
                // Print Broken links
                console.log(Color.RED+ `[${result.status}] ${result.url} -- ${result.state}` +Color.RESET)
            } else if(result.state == 'SKIPPED') {
                //Print Skipped links only if verbosity is set to ALL_LINKS
                if(this.#verbosity == Verbosity.ALL_LINKS)
                    console.log(Color.GRAY+ `[---] ${result.url} -- ${result.state}` +Color.RESET)
            } else if(this.#verbosity >= Verbosity.INFO) {
                //Print remaining links if verbosity is set to INFO or higher
                console.log(`[${result.status}] ${result.url} -- ${result.state}` )
            }
        });
    }

    #startLinkChecking(startingPath) {
        console.log(`${Color.BLUE}******************************************************************************`)
        console.log(`${Color.BLUE}Checking Links for ${startingPath}`)
        console.log(`${Color.BLUE}******************************************************************************${Color.RESET}\n`)

        this.#linkinatorOptions.path = startingPath;

        return this.#checker.check(this.#linkinatorOptions);
    }

    validateLinks = async (paths) => {
        await this.#prepareLinkChecker();

        // gether results from each starting path validation
        this.#validationResults = [];
        this.#validationSuccess = true;

        for(let i=0; i<paths.length; i++) {
            let path = paths[i];

            try {
                // check links and save results for later
                let result = await this.#startLinkChecking(path);
                result.startingPath = path;

                this.#validationResults.push(result);

                // If there are any failed links then set the validation to failed
                if(result.passed == false) {
                    this.#validationSuccess = false;
                }
            } catch (error) {
                console.error(`Something went wrong when validating ${path}`);
                console.error(error);
            }
        }

        console.log('>>> FINISHED CHECKING LINKS')

        return this.#validationSuccess;
    }

    printSummary() {

        console.log()
        if(this.#validationSuccess) {
            console.log(`${Color.GREEN}##################################`)
            console.log(`${Color.GREEN}# WEBSITE LINK VALIDATION PASSED #`)
            console.log(`${Color.GREEN}##################################${Color.RESET}`);
        } else {
            console.log(`${Color.RED}##################################`)
            console.log(`${Color.RED}# WEBSITE LINK VALIDATION FAILED #`)
            console.log(`${Color.RED}##################################${Color.RESET}`);
        }

        this.#validationResults.forEach(result => {
            this.#printSingleRunSummary(result);
        });

    }

    #printSingleRunSummary(result) {
        // SUMMARY
        const skippedLinks = result.links.filter(x => x.state === 'SKIPPED');
        let brokenLinks = result.links.filter(x => x.state === 'BROKEN');

        console.log(`\n${Color.BLUE}-----------------------------------------------------------------------
${Color.BLUE}SUMMARY FOR:       ${result.startingPath}${Color.RESET}
${(result.passed)? Color.GREEN : Color.RED}Validation Passed: ${result.passed}${Color.RESET}
Links found:       ${result.links.length}
Broken links:      ${brokenLinks.length}
Checked links:     ${result.links.length - skippedLinks.length}
Skipped links:     ${skippedLinks.length}`)

        if(brokenLinks.length > 0) {
            brokenLinks = this.#parseBrokenLinks(brokenLinks);

            console.log(Color.RED + '----- BROKEN LINKS: -----' + Color.RESET)
            // print links info in red
            console.log(JSON.stringify(brokenLinks, null, 2));
        }
    }

    #parseBrokenLinks(brokenLinks) {
        let result = {}

        // Sort broken links by parent
        brokenLinks = brokenLinks.sort((a, b) => a.parent > b.parent ? 1: -1)

        // group results by parent
        brokenLinks.forEach(link => {
            if(!result[link.parent]) {
                result[link.parent] = {
                    parent: link.parent,
                    brokenLinks: []
                }
            }

            const lastFailureDetails = link.failureDetails[link.failureDetails.length-1];

            // Only keep url, status and statusText
            result[link.parent].brokenLinks.push({
                url: link.url,
                status: link.status,
                statusText: lastFailureDetails.statusText || lastFailureDetails.message
            })
        });

        return Object.values(result);
    }
}

module.exports = { LinkValidator, Verbosity, Color, domainsToIgnore }
