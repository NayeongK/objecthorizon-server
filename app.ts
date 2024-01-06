require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
import { Request, Response, NextFunction } from "express";

import index from "./routes/index";
import images from "./routes/images";

const app = express();
mongoose.connect(process.env.MONGODB_URI);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors(process.env.CORS_ORIGIN));

app.use("/", index);
app.use("/images", images);

// catch 404 and forward to error handler
app.use(function (req: Request, res: Response, next: NextFunction) {
  next(createError(404));
});

// error handler
app.use(function (err: any, req: Request, res: Response) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: res.locals.error,
  });
});

module.exports = app;
