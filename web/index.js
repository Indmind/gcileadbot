const http = require('http');

const gather = require('../gather');

const port = process.env.PORT || 8080;

const server = http.createServer(async (request, response) => {
    const result = await gather.exec('update')
    response.end(result)
});

server.listen(port, (err) => {
    if (err) {
        console.log(err)
    }

    console.log(`server is listening on ${port}`)
})