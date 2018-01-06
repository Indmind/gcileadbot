const Telegraf = require("telegraf");
const http = require("http");

const gather = require("./gather");

const app = new Telegraf(process.env.TOKEN);

const port = process.env.PORT || 8080;

const server = http.createServer(async (request, response) => {
    const result = await gather.exec("update");
    response.end(result);
});

server.listen(port, err => {
    if (err) {
        console.log(err);
    }

    console.log(`server is listening on ${port}`);
});

app.hears("all", ctx => {
    return ctx.reply("it works!");
});

app.startPolling();
