require("dotenv").config();
const express = require("express");
const ytdl = require("ytdl-core");
const cors = require("cors");
const session = require("express-session");
const mongoose = require("mongoose");
const MongoDBStore = require("connect-mongodb-session")(session);
const URI = process.env.MONGODB_URI;

const store = new MongoDBStore({
  uri: URI,
  collection: "sessions",
});

const DownloadRouter = require("./routers/downloads");
const StreamRouter = require("./routers/stream");
const AuthRouter = require("./routers/auth");
const ChannelRouter = require("./routers/channel");
const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "http://localhost:3000",
      "https://music-simple.web.app",
    ],
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
    credentials: true,
  })
);
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(express.json());

app.set("trust proxy", 1);

app.use(
  session({
    secret: "the secret",
    saveUninitialized: true,
    cookie: {
      sameSite: "none",
      secure: true,
      maxAge: 1000 * 60 * 60,
    },
    resave: false,
    store: store,
  })
);

// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "https://music-simple.web.app");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

// download

app.use("/auth", AuthRouter);

app.use("/download", DownloadRouter);

app.use("/stream", StreamRouter);

app.use("/channel", ChannelRouter);

app.use("/get-info/:videoId", (req, res, next) => {
  ytdl
    .getBasicInfo(`https://www.youtube.com/watch?v=${req.params.videoId}`)
    .then((info) => {
      res.send({ info });
    });
});

app.listen(process.env.POST || 5000, () => {
  console.log(process.env.POST);
  console.log("server on");
  mongoose.connect(URI).then(() => {
    console.log("connected mongodb!");
  });
});
