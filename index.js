const http = require("http");
const https = require("https");
const path = require("path");
const fs = require("fs");
const url = require('url');
const socket = require('socket.io');
const cors = require('cors');

// const socketListening = require('./socket');

// REDIRECTION TO HTTPS

const cert = fs.readFileSync('/etc/letsencrypt/archive/markeybass.com/cert1.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/archive/markeybass.com/chain1.pem');
const fullchain = fs.readFileSync('/etc/letsencrypt/archive/markeybass.com/fullchain1.pem');
const key = fs.readFileSync('/etc/letsencrypt/archive/markeybass.com/privkey1.pem');

const creds = {
  key,
  cert,
  ca
} 

const httpsServer = https.createServer(creds, (req, res) => {
  //  cors
  res.setHeader('Access-Control-Allow-Headers', '*');

  // Build file path
  let filePath = path.join(
    __dirname,
    "public",
    req.url === "/" ? "index.html" : req.url
  );

  // Extension of file
  let extname = path.extname(filePath);

  // Initial content type
  let contentType = "text/html";

  // Check ext and set content type
  switch (extname) {
    case ".js":
      contentType = "text/javascript";
      break;
    case ".css":
      contentType = "text/css";
      break;
    case ".json":
      contentType = "application/json";
      break;
    case ".png":
      contentType = "image/png";
      break;
    case ".jpg":
      contentType = "image/jpg";
      break;
  }

  // Check if contentType is text/html but no .html file extension
  if (contentType == "text/html" && extname == "") filePath += ".html";

  // log the filePath
  console.log(filePath);

  // Read File
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code == "ENOENT") {
        // Page not found
        fs.readFile(
          path.join(__dirname, "public", "404.html"),
          (err, content) => {
            res.writeHead(404, { "Content-Type": "text/html" });
            res.end(content, "utf8");
          }
        );
      } else {
        //  Some server error
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // Success
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content, "utf8");
    }
  });
});


const httpPORT = 5002;

const httpsPORT = 8002

const httpServer = http.createServer((req, res) => {
  // set cors
  res.setHeader('Access-Control-Allow-Headers', '*');
  const myurl = url.parse(req.url);               // important
  res.writeHead(301, { location: `https://markeybass.com:${httpsPORT}${myurl.pathname}`})
  res.end();
});





const io = socket(httpsServer);

io.on('connection', (socket) => {
  console.log('socket is connected', socket.id);
  
  // hendle chat event
  socket.on('chat', (data) => {
    // console.log(data)
    // referring all computers conected to the socket
    io.sockets.emit('chat', data);
  });
  
  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', data)
  });
});


httpServer.listen(httpPORT, () => console.log(`Server running on port ${httpPORT}`));
httpsServer.listen(httpsPORT, () => console.log(`Server running on port ${httpsPORT}`));

