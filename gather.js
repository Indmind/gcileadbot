const fetch = require('node-fetch')
const fs = require('fs')

async function fetchJSON(url){
    const response = await fetch(url)
    return await response.json()
}

;(async () => {
    const data = await fetchJSON('https://gci-leaders.netlify.com/data.min.json')
    fs.writeFileSync('./data/data.json', JSON.stringify(data))
})()