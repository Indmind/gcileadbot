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

async function pre2017(){
    const data = await fetchJSON(
        "https://gci-leaders.netlify.com/pre2017.json"
    );

    fs.writeFileSync("./data/pre2017.json", JSON.stringify(data));

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
    pre2017();
} else {
    module.exports = { exec: gather, stamp, pre2017 };
}
