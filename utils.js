const { Extra } = require("telegraf");

function timeDifference(current, previous) {
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;

    const elapsed = current - previous;

    if (elapsed < msPerMinute) {
        return `${Math.round(elapsed / 1000)} seconds ago`;
    } else if (elapsed < msPerHour) {
        return `${Math.round(elapsed / msPerMinute)} minutes ago`;
    } else if (elapsed < msPerDay) {
        return `${Math.round(elapsed / msPerHour)} hours ago`;
    } else if (elapsed < msPerMonth) {
        return `${Math.round(elapsed / msPerDay)} days ago`;
    } else if (elapsed < msPerYear) {
        return `${Math.round(elapsed / msPerMonth)} months ago`;
    } else {
        return `${Math.round(elapsed / msPerYear)} years ago`;
    }
}

function log(ctx) {
    console.log(
        `${ctx.message.from.first_name} ${ctx.message.from.last_name}[${
            ctx.message.from.id
        }]: ${ctx.message.text}`
    );
}

const allButton = Extra.markdown().markup(m =>
    m
        .keyboard([m.callbackButton("Show All"), m.callbackButton("Search")])
        .resize()
);

const cancelButton = Extra.markdown().markup(m =>
    m.keyboard([m.callbackButton("Cancel")]).resize()
);

module.exports = { timeDifference, log, allButton, cancelButton };
