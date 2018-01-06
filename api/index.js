const Telegraf = require('telegraf');

const app = new Telegraf(process.env.TOKEN);

app.hears('all', ctx => {
  return ctx.reply('it works!');
});

app.startPolling();
