const express = require("express");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.set("port", process.env.PORT ?? 8081);
const routes = require("./routes/index.js");
app.use("/api", routes);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.listen(app.get("port"), () => {
  console.log(`Start server on port ${app.get("port")}`);
});