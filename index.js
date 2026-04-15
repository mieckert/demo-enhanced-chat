const http = require("http");
const path = require("path");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.use("/bootstrap", express.static(path.join(__dirname, "/node_modules/bootstrap/dist")));
app.use("/jquery", express.static(path.join(__dirname, "/node_modules/jquery/dist")));
app.use(express.static("static"));

async function main() {
    app.get("/", function(req, res) {
        res.sendFile(path.join(__dirname, "/static/index.html"));    
    });
    http.createServer(app).listen(port);
    console.log("HTTP Server running.");
}
main();
