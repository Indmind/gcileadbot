const fs = require("fs");
const stringSimilarity = require("string-similarity");

async function showAll() {
    const gcidata = await readJSON("./data/data.json");

    const fetchingTemplate = gcidata.map(templateOrg);
    const template = await Promise.all(fetchingTemplate);

    return {
        result: template.join("\n"),
        time_diff: stamp()
    };
}

async function templateOrg(org, leaderList) {
    let leadlist = [];

    const leaderData = getLeadersNameData(org.leaders);

    if (Array.isArray(leaderList)) {
        leaderList = leaderList.map((leader, index) => ({
            ...leader,
            github: leaderData[index].github
        }));

        leadlist = leaderList.map(user => {
            return user.highlight
                ? `*${user.name}* ${templateUserAcc(user)}`
                : `${user.name} ${templateUserAcc(user)}`;
        });
    } else {
        leadlist = leaderData.map(
            user => `${user.name} ${templateUserAcc(user)}`
        );
    }

    return `[${org.name}](https://codein.withgoogle.com/organizations/${
        org.slug
    })\n\n_Tasks Completed: ${
        org.completed_task_instance_count
    }_\n\n${leadlist.join("\n")}\n`;
}

async function findOrg(query) {
    const gcidata = await readJSON("./data/data.json");
    const orgName = gcidata.map(org => org.name);
    const testName = stringSimilarity.findBestMatch(query, orgName);
    const nameRes = testName.bestMatch;
    const orgInfo = gcidata.find(org => org.name == nameRes.target);

    return {
        result: orgInfo,
        accuracy: nameRes.rating
    };
}

async function findUser(query) {
    const gcidata = await readJSON("./data/data.json");

    const matchResult = gcidata.map(org =>
        stringSimilarity.findBestMatch(
            query,
            getLeadersNameData(org.leaders).map(user => user.name)
        )
    );

    const bestResult = matchResult
        .map(result => result.bestMatch)
        .sort((a, b) => b.rating - a.rating)[0];

    const resultName = bestResult.target;

    const orgInfo = gcidata.find(org =>
        getLeadersNameData(org.leaders)
            .map(user => user.name)
            .includes(resultName)
    );

    return {
        name: resultName,
        org: orgInfo,
        accuracy: bestResult.rating
    };
}

function templateUserAcc(user) {
    if (user.github) {
        return `([github](${user.github}))`;
    }

    return "";
}

async function readJSON(path) {
    return JSON.parse(fs.readFileSync(path));
}

function getLeadersNameData(leader) {
    return leader.map(lead => ({
        name: lead.display_name.replace("_", " "),
        github: lead.github_account
            ? `https://github.com/${lead.github_account}`
            : null
    }));
}

function stamp() {
    return fs.readFileSync("./data/ago.txt", "UTF-8");
}

module.exports = {
    showAll,
    findOrg,
    findUser,
    templateOrg,
    stamp
};
