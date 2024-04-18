const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const bodyParser = require('body-parser');

dotenv.config();

const app = express();
app.set("port", process.env.PORT ?? 8081);
const routes = require("./routes/index.js");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api", routes);

app.listen(app.get("port"), () => {
  console.log(`Start server on port ${app.get("port")}`);
});