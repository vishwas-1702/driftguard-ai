const express = require("express");

const healthRoute = require("./routes/health.route");

const app = express();

app.use(express.json());

app.use("/health", healthRoute);

module.exports = app;