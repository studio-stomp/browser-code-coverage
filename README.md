# browser-code-coverage
Project combining Puppeteer and Istanbul JS to generate JS &amp; CSS code coverage reports for a given URL.

## Introduction
This project is intended to run through Docker, but the code itself is not inherently tied to Docker. Provided the required dependencies for running a headless Chrome are installed, one should be able to run this without Docker.

### What problem is this project trying to solve?
When checking page speed performance, for example through Google PageSpeed Insights, a recommendation that shows regularly enough us unused CSS and JS, and blocking JS & CSS. As projects exist over time, often code doesn't get used anymore. Or perhaps some code was added expecting to be used in the future and that moment never came. In any case, projects tend to accumulate unused code and this is harder to find for compiled JS & CSS.

### A solution
Chrome has the ability to show code coverage for JS & CSS, which also indicates unused code of course. One can check the code coverage tab manually, but of course it would be better to automate this. Automation provides both hands-off for the programmer / QA as well as consistency in the testing.

Enter Puppeteer. Puppeteer provides an API in Node for controlling a (headless) Chrome instance. The API can also expose coverage data. This project uses Puppeteer to load pages in a few different profiles (phone, tablet, desktop) and collects the aggregated code coverage data. 

This is then provided as input for InstanbulJS, a project that can generate code coverage reports. This project renders a HTML report

## Installation

### Docker
Using the `./dkr run your-domain-here` should build and setup the container on the first run. This setup includes the required `npm install` command for installing the Node dependencies.

Under the hood this command executes basically `node index.js your-domain-here`.

Main reason to use Docker is to have an easier time switching out different browsers and setting up the tool on different computers.

### Vanilla NodeJS
**NOTE: untested**

Install dependencies: `npm install`

Run the tool: `node index.js your-domain-here`

## Roadmap

### Follow links
Let Puppeteer load all internal links that are found. This would give an indication of code unused throughout the project. Needs to be able to track which URLs have already been checked. Should reuse the cache of tracked URLs for next device profile. Perhaps limit the amount of links to follow, as an optional argument.

### Define URL grouping
The first release groups by domain, and checks only the domain. But it could be interesting to load multiple pages on a domain and report on that domain. Or to load multiple pages and report per page. This depends on what data one is interested in; code unused on a specific page versus code unused in a Story.

### Provide complexer configuration
Complexer configuration could be entered through passing in a JSON string as argument, or defining a config file perhaps. This config could define which device profiles to use, which URLs to check, how the URLs should be grouped (as in one report per group) 

## Credits
Initial inspiration from:

- https://github.com/Zrce/puppeteer-coverage-report-test
- https://gist.github.com/Friss/8121c0462544d7515c498b512dbe9303
