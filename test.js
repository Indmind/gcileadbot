const gci = require("./gci")

;(async () => {
    const stamp = await gci.stamp()
    console.log(stamp)
})()