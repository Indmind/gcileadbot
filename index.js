const Telegraf = require("telegraf");
const http = require("http");

const gather = require("./gather");
const gci = require("./gci");
const utils = require("./utils");

const app = new Telegraf(process.env.TOKEN);

const port = process.env.PORT || 8080;

const server = http.createServer(async (request, response) => {
    await gather.stamp();
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
    const text2 = `${res2.join("\n")}\nLast updated: ${answer.time_diff}`;

    await ctx.replyWithMarkdown(text1, utils.allButton);
    await ctx.replyWithMarkdown(text2, utils.allButton);
    return true;
});

app.hears(/organization/i, async ctx => {
    utils.log(ctx);

    const orgButton = await utils.createAllOrgsButton();

    return await ctx.replyWithMarkdown("*Choose organization*", orgButton);
});

app.hears(/cancel/i, async ctx => {
    utils.log(ctx);
    //remove state
    state[ctx.message.from.id] = null;
    return await ctx.reply("Canceled", utils.allButton);
});

app.on("callback_query", async ctx => {
    const orgName = ctx.update.callback_query.data;
    const orgInfo = await gci.findOrg(orgName);
    const templateOrg = await gci.templateOrg(orgInfo.result);
    const stamp = await gci.stamp();

    await ctx.replyWithMarkdown(templateOrg, utils.allButton);
    return ctx.replyWithMarkdown(`_Last updated: ${stamp}_`);
});

app.on("text", async ctx => {
    utils.log(ctx);

    const userId = ctx.message.from.id;

    const menu = utils.allButton;

    if (state[userId]) {
        if (state[userId].action === "search") {
            const query = ctx.message.text;
            const orgInfo = await gci.findUser(query);
            const templateOrg = await gci.templateOrg(orgInfo.org);
            const stamp = await gci.stamp()

            //remove state
            state[userId] = null;

            await ctx.replyWithMarkdown(templateOrg);
            return await ctx.replyWithMarkdown(
                `Last updated: ${stamp}\nAccuracy: ${orgInfo.accuracy}`,
                menu
            );
        }
    }

    return await ctx.reply("I don't know what do you want :(", menu);
});

app.catch(err => {
    console.log("Ooops", err);
});

app.startPolling();
