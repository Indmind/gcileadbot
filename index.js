const Telegraf = require("telegraf");
const http = require("http");

const gather = require("./gather");
const gci = require("./gci");

const app = new Telegraf(process.env.TOKEN);

const port = process.env.PORT || 8080;

const server = http.createServer(async (request, response) => {
    const result = await gather.exec("update");
    response.end(result);
});

server.listen(port, err => {
    if (err) console.log(err);

    console.log(`server is listening on ${port}`);
});

app.hears("all", async ctx => {
    const answer = await gci.showAll();
    return ctx.replyWithMarkdown(answer);
});

app.startPolling();
