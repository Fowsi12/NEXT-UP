import express from "express";
import { pool } from "../db/connect.js";

const db = pool();

const server = express();
const port = 3009;

server.use(express.static("frontend"));
server.use(onEachRequest);
server.listen(port, onServerReady);

function onServerReady() {
  console.log("Webserver running on port", port);
}

function onEachRequest(request, response, next) {
  console.log(new Date(), request.method, request.url);
  request.db = db;
  next();
}
