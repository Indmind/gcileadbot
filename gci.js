const fs = require("fs");

async function showAll() {
    const gcidata = await readJSON("./data/data.json");

    const arrResponse = gcidata.map(
        org =>
            `*${org.name}*

_Tasks Completed: ${org.completed_task_instance_count}_

${getLeadersNameList(org.leaders).join("\n")}`
    );

    console.log(arrResponse.join("\n"));
}

async function readJSON(path) {
    return JSON.parse(fs.readFileSync(path));
}

function getLeadersNameList(leader) {
    return leader.map(lead => lead.display_name);
}

module.exports = {
    showAll
};
