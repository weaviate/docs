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
        console.log(`${Color.BLUE}**************************************************************`)
        console.log(`${Color.BLUE}Checking Links for ${startingPath}`)
        console.log(`${Color.BLUE}**************************************************************${Color.RESET}`)

        this.#linkinatorOptions.path = startingPath;

        return this.#checker.check(this.#linkinatorOptions);
    }

    validateLinks = async (paths) => {
        await this.#prepareLinkChecker();
        
        // gether results from each starting path validation
        let results = [];
        for(let i=0; i<paths.length; i++) {
            let path = paths[i];
    
            try {
                // check links and save results for later
                let result = await this.#startLinkChecking(path);
                result.startingPath = path;
        
                results.push(result);
            } catch (error) {
                console.error(`Something went wrong when validating ${path}`);
                console.error(error);
            }
    
        }
    
        console.log('>>> FINISHED CHECKING LINKS')
    
        return results;
    }

    printSummary(result) {
        // SUMMARY
        const skippedLinks = result.links.filter(x => x.state === 'SKIPPED');
        let brokeLinks = result.links.filter(x => x.state === 'BROKEN');
    
        console.log(`${Color.BLUE}-----------------------------------------------------------------------
${Color.BLUE}SUMMARY FOR:       ${result.startingPath}
${(result.passed)? Color.GREEN : Color.RED}Validation Passed: ${result.passed}${Color.RESET}
Links found:       ${result.links.length}
Broken links:      ${brokeLinks.length}
Checked links:     ${result.links.length - skippedLinks.length}
Skipped links:     ${skippedLinks.length}`)
    
        brokeLinks = brokeLinks.map(link => {
            let lastFailureDetails = link.failureDetails[link.failureDetails.length-1]
    
            return {
                parent: link.parent,
                url: link.url,
                status: link.status,
                // get either statusText or message from the last failure object
                statusText: lastFailureDetails.statusText || lastFailureDetails.message,
            }
        })
    
        if(brokeLinks.length > 0) {
            console.log(Color.RED + '----- BROKEN LINKS: -----' + Color.RESET)
    
            // print links info in red
            console.log(JSON.stringify(brokeLinks, null, 2));
            // console.log(JSON.stringify(prettyLink, null, 2));
        }
    }
}

module.exports = { LinkValidator, Verbosity, Color }