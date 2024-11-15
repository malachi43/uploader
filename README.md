### UPLOADER

This repository demonstrates how to build a simple client-server application for large file uploads. It enables file transfers from a client to a server directly 
through the terminal, with real-time progress tracking. The implementation leverages streams for efficient data processing, displaying upload progress, while the 
server handles incoming streams, writes files to the destination, and verifies data integrity. Key features include support for chunked uploads and robust error handling, 
providing a lightweight and reliable solution for transferring large files.

#### Getting started
- ```cd``` into ```file-uploader```
- open two terminals
- on one termianl run the command ```node server.js```
- on another terminal run the client process using this command ```node client.js <file-path>```
- you will get a feedback if the file upload was successful.
- ```cd``` into the ```storage/uploads``` folder located in the current directory containing the server.js and client.js files
- in this folder you will find the just uploaded file.
  
