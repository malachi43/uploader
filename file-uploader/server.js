const net = require("node:net")
const PORT = 5000
const host = "localhost"
const fs = require("node:fs/promises")
const { join } = require('path')

const server = net.createServer(() => { })

//this event fires when a connection is made
server.on('connection', async (socket) => {
    console.log(`New connection`)
    let fileHandle = null
    let writeStream = null

    socket.on("data", async (chunk) => {
        if (!fileHandle) {
            //we paused the stream so we could open the file and create a stream from it,inorder to avoid losing some chunks while the file is being opened.
            socket.pause()
            const data = chunk.toString('utf-8')
            const fileName = data.slice(data.indexOf("#") + 1, data.lastIndexOf("#"))
            fileHandle = await fs.open(join(__dirname, "storage", "uploads", fileName), "w")
            writeStream = fileHandle.createWriteStream()

            //resume reading from the socket(stream)
            socket.resume()

            //start writing chunk after the index of filename. 
            if (!writeStream.write(data.slice(data.lastIndexOf('#') + 1))) {
                socket.pause()
            }

            //Alow the internal buffer to drain before resuming reading from the stream Note: the "drain" is attached once during file creation to avioding creating multiple "drain listeners" on every data event.
            writeStream.on("drain", () => {
                socket.resume()
            })

        } else {
            //writing to our storage folder "./storage/uploads"
            if (!writeStream.write(chunk)) {
                socket.pause()
            }
        }


    })

    socket.on('end', async () => {
        await fileHandle.close()
        fileHandle = null
        writeStream = null
        console.log(`Connection ended`)
    })

    socket.on("error", (err) => {
        console.log(`Error: `, err.message)
    })
})

server.listen(PORT, host, () => {
    console.log(`Uploader server listening on`, server.address(), `press Ctrl-C to terminate`)
})


server.on("error", (err) => {
    console.log(`Error: `, err.message)
})