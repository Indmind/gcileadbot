const fs = require("fs");
const stringSimilarity = require("string-similarity");

const util = require("./utils");

async function showAll() {
    const gcidata = await readJSON("./data/data.json");

    const fetchingTemplate = gcidata.map(templateOrg);
    const template = await Promise.all(fetchingTemplate);

    return {
        result: template,
        time_diff: stamp()
    };
}

async function templateOrg(org) {
    return `[${org.name}](https://codein.withgoogle.com/organizations/${
        org.slug
    })\n\n_Tasks Completed: ${
        org.completed_task_instance_count
    }_\n\n${getLeadersNameList(org.leaders).join("\n")}\n`;
}

async function findOrg(query) {
    const gcidata = await readJSON("./data/data.json");
    const orgName = gcidata.map(org => org.name);
    const testName = stringSimilarity.findBestMatch(query, orgName);
    const nameRes = testName.bestMatch;
    const orgInfo = gcidata.find(org => org.name == nameRes.target);

    return { result: orgInfo, accuracy: nameRes.rating };
}

async function findUser(query) {
    const gcidata = await readJSON("./data/data.json");

    const matchResult = gcidata.map(org =>
        stringSimilarity.findBestMatch(query, getLeadersNameList(org.leaders))
    );

    const bestResult = matchResult
        .map(result => result.bestMatch)
        .sort((a, b) => b.rating - a.rating)[0];

    const resultName = bestResult.target;

    const orgInfo = gcidata.find(org =>
        getLeadersNameList(org.leaders).includes(resultName)
    );

    return { org: orgInfo, accuracy: bestResult.rating };
}

async function readJSON(path) {
    return JSON.parse(fs.readFileSync(path));
}

function getLeadersNameList(leader) {
    return leader.map(lead => lead.display_name.replace("_", " "));
}

function stamp() {
    const updated = fs.statSync("./data/data.json").mtime;
    return util.timeDifference(
        new Date().getTime(),
        new Date(updated).getTime()
    );
}

module.exports = {
    showAll,
    findOrg,
    findUser,
    templateOrg,
    stamp
};
