const Telegraf = require('telegraf');

const app = new Telegraf(process.env.TOKEN);

app.hears('get', ctx => {
  return ctx.reply('it works!');
});

app.startPolling();