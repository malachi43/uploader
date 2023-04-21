const net = require('net')
const fs = require("node:fs/promises")
const path = require('path')
let progressPercentage = 0

const clearLine = (direction) => {
    return new Promise((resolve, reject) => {
        process.stdout.clearLine(direction, () => { resolve() })
    })
}

const moveCursor = (dx, dy) => {
    return new Promise((resolve, reject) => {
        process.stdout.moveCursor(dx, dy, () => {
            resolve()
        })
    })
}


const socket = net.createConnection({ host: "localhost", port: 5000 }, async () => {
    const filePath = process.argv[2]
    if (!filePath) {
        console.log(`missing third argument(the file intended to be uploaded).`)
        console.log(`It should have the form "node client.js <file-path>"`)
        process.exit(0)
    }

    console.log(`connected to the uploader server`)

    const fileSize = (await fs.stat(filePath)).size
    let numOfBytesUploaded = 0

    const fileHandle = await fs.open(filePath, "r")
    const readStream = fileHandle.createReadStream()

    const fileName = process.platform === "win32" ? path.win32.basename(filePath) : path.basename(filePath)

    //the filename to be used to save the uploaded file. 
    socket.write(`#${fileName}#`)

    //this log helps makes the upload progress to remain on the same line
    console.log()

    //Reading contents from the file
    readStream.on("data", async (chunk) => {
        //the increasing number of bytes uploaded
        numOfBytesUploaded += chunk.byteLength

        //if "socket.write" returns false a "backpressure" is encountered and the readStream should be paused.
        if (!socket.write(chunk)) {
            readStream.pause()
        }

        //moves the cursor one line up.
        await moveCursor(0, -1)
        //clears the entire line the cursor is in.
        await clearLine(0)

        progressPercentage = (numOfBytesUploaded / fileSize) * 100
        console.log(`Uploading...%d%`, Math.floor(progressPercentage))

    })


    //Allows the internal buffer of the socket to drain before resuming reading from the file.
    socket.on('drain', () => {
        readStream.resume()
    })

    //when the file is completed read this event fires.
    readStream.on('end', async () => {
        await fileHandle.close()
        console.log(`File upload successful.`)
        //ends the stream after write is done completed. 
        socket.end()
    })

    //this event fires in the event of an error
    socket.on("error", (err) => {
        console.log(`Error: `, err.message)
    })

})
