const gci = require("./gci");

(async () => {
    const data = await gci.showAll();
    console.log(data);
})();
