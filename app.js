var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var fs = require("fs");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var recordRouter = require("./routes/record");
var recordsRouter = require("./routes/records");
var verificationRouter = require("./routes/verification");
var settingRouter = require("./routes/setting");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.disable("x-powered-by");

// TODO 开发期间暂时对 localhost:3000 开放
app.use(
  cors({
    origin: [/localhost:3000/, /^(https?:\/\/(www\.)?qukuailianji\.com)$/],
  })
);

// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(
  path.join(__dirname, "logs/access.log"),
  {
    flags: "a",
  }
);

// 自定义 morgan token type，用来记录 /record router 的 request payload
logger.token("payload", function (req, res) {
  return JSON.stringify(req.body).replace(/\"/g, `'`);
});

// 自定义 morgan token type，用来记录 /record router 的 response data
logger.token("response", function (req, res) {
  const data = res.txData || res.errorInfo;
  return data ? JSON.stringify(data).replace(/\"/g, `'`) : null;
});

app.use(logger("dev"));
// setup the logger
app.use(
  logger(
    `:remote-addr - :remote-user [:date[clf]] ":method :url :payload HTTP/:http-version" :status :res[content-length] ":response" :total-time[3] ":referrer" ":user-agent"`,
    {
      stream: accessLogStream,
      skip: function (req, res) {
        return req.method !== "POST";
      },
    }
  )
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", indexRouter);
app.use("/record", recordRouter);
app.use("/records", recordsRouter);
app.use("/verification", verificationRouter);
app.use("/setting", settingRouter);

app.use(express.static(path.join(__dirname, "public")));
// frontend build file
app.use(express.static(path.join(__dirname, "out")));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
