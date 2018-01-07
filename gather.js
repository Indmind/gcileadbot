const fetch = require("node-fetch");
const fs = require("fs");

async function fetchJSON(url) {
    const response = await fetch(url);
    return await response.json();
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
} else {
    module.exports.exec = gather;
}
