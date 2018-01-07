const fetch = require("node-fetch");
const fs = require("fs");
const cheerio = require("cheerio");

const utils = require("./utils");

async function fetchJSON(url) {
    const response = await fetch(url);
    return await response.json();
}

async function fetchHTML(url) {
    const response = await fetch(url);
    return await response.text();
}

async function stamp() {
    const html = await fetchHTML("https://gci-leaders.netlify.com");
    fs.writeFileSync("./data/data.html", html);

    const $ = cheerio.load(html);

    const lastUpdatedDate = $("small#time")
        .text()
        .replace("Last updated: ", "");

    const diff = utils.timeDifference(
        new Date().getTime(),
        new Date(lastUpdatedDate).getTime()
    );

    fs.writeFileSync("./data/ago.txt", diff);
}

async function gather(proc = "module") {
    console.log(`Gathering data from ${proc}`);

    const data = await fetchJSON(
        "https://gci-leaders.netlify.com/data.min.json"
    );

    fs.writeFileSync("./data/data.json", JSON.stringify(data));

    return "Done!";
}

if (require.main === module) {
    gather("cli");
    stamp();
} else {
    module.exports = { exec: gather, stamp };
}
