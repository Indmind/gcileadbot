const Telegraf = require("telegraf");
const http = require("http");

const gather = require("./gather");
const gci = require("./gci");
const utils = require("./utils");

const app = new Telegraf(process.env.TOKEN);

const port = process.env.PORT || 8080;

const server = http.createServer(async (request, response) => {
    await gather.stamp();
    await gather.pre2017();
    const result = await gather.exec("update");
    response.end(result);
});

server.listen(port, err => {
    if (err) console.log(err);

    console.log(`server is listening on ${port}`);
});

app.command("start", ctx => {
    utils.log(ctx);
    ctx.reply("Hello! use the button below to interact", utils.allButton);
});

let state = {};

app.hears(/year/i, async ctx => {
    utils.log(ctx);

    const buttonYear = await utils.createButtonYear();

    return ctx.reply("Not done yet...", buttonYear);
});

app.hears(/search/i, async ctx => {
    utils.log(ctx);

    const userId = ctx.message.from.id;

    if (!state[userId]) state[userId] = { id: userId };

    state[userId].action = "search";

    return await ctx.replyWithMarkdown(
        `Send me _user name_ you want to search`,
        utils.cancelButton
    );
});

app.hears(/all/i, async ctx => {
    utils.log(ctx);

    const answer = await gci.showAll();

    const res = answer.result;

    // split into two array
    const mid = Math.floor(res.length / 2);
    const res1 = res.slice(0, mid);
    const res2 = res.slice(mid);

    const text1 = `${res1.join("\n")}\n`;
    const text2 = `${res2.join("\n")}\n`;

    await ctx.replyWithMarkdown(text1);
    await ctx.replyWithMarkdown(text2);

    return ctx.replyWithMarkdown(
        `Last updated: ${answer.time_diff}`,
        utils.allButton
    );
});

app.hears(/organization/i, async ctx => {
    utils.log(ctx);

    const orgButton = await utils.createAllOrgsButton();

    return await ctx.replyWithMarkdown("*Select organization*", orgButton);
});

app.hears(/cancel/i, async ctx => {
    utils.log(ctx);
    //remove state
    state[ctx.message.from.id] = null;

    return await ctx.reply("Canceled", utils.allButton);
});

app.on("callback_query", async ctx => {
    console.log(`Callback Query: ${ctx.update.callback_query.data}`);

    const cbdata = ctx.update.callback_query.data.split(":");
    const action = cbdata[0];
    const text = cbdata[1];

    if (action === "cy") {
        const result = await gci.showAllByYear(parseInt(text));

        return await ctx.replyWithMarkdown(result, utils.allButton);
    }

    if (action === "org") {
        const orgInfo = await gci.findOrg(text);
        const templateOrg = await gci.templateOrg(orgInfo.result);
        const stamp = await gci.stamp();

        await ctx.replyWithMarkdown(templateOrg, utils.allButton);

        return ctx.replyWithMarkdown(`_Last updated: ${stamp}_`);
    }
});

app.on("text", async ctx => {
    utils.log(ctx);

    const userId = ctx.message.from.id;
    const userText = ctx.message.text;

    const menu = utils.allButton;

    if (state[userId]) {
        if (state[userId].action === "search") {
            //remove state
            state[userId] = null;

            const result = await findUser(userText);

            await ctx.replyWithMarkdown(result.templateOrg);

            return await ctx.replyWithMarkdown(
                `Last updated: ${result.stamp}\nAccuracy: ${
                    result.user.accuracy
                }`,
                menu
            );
        }
    }

    // try to find organization
    const orgInfo = await gci.findOrg(userText);

    if (orgInfo.accuracy > 0.5) {
        const template = await gci.templateOrg(orgInfo.result);
        const stamp = await gci.stamp();

        await ctx.replyWithMarkdown(
            `I found an organization you might be looking for \n\n${template}`
        );

        return await ctx.replyWithMarkdown(
            `Last updated: ${stamp}\nAccuracy: ${orgInfo.accuracy}`,
            menu
        );
    }

    // try to find user
    const result = await findUser(userText);

    if (result.user.accuracy > 0.5) {
        await ctx.replyWithMarkdown(
            `I found a username you might be looking for \n\n${
                result.templateOrg
            }`
        );

        return await ctx.replyWithMarkdown(
            `Last updated: ${result.stamp}\nAccuracy: ${result.user.accuracy}`,
            menu
        );
    }

    return await ctx.reply("I can't find anything :(", menu);
});

app.catch(err => {
    console.log("Ooops", err);
});

app.startPolling();

async function findUser(query) {
    const user = await gci.findUser(query);

    const leaderList = user.org.leaders.map(lead =>
        lead.display_name.replace("_", " ")
    );

    const leaderListHighlighted = leaderList.map(name => ({
        name,
        highlight: name === user.name
    }));

    const templateOrg = await gci.templateOrg(user.org, leaderListHighlighted);
    const stamp = await gci.stamp();

    return { templateOrg, stamp, user };
}
