require("dotenv").config();
const express = require("express");
const ytdl = require("ytdl-core");
const cors = require("cors");
const session = require("express-session");
const mongoose = require("mongoose");
const MongoDBStore = require("connect-mongodb-session")(session);
const Youtube = require("youtube-stream-url");
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
// app.use(cors());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
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
app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "http://localhost:3000",
      "https://music-simple.web.app",
      "https://audiosimplelife.web.app",
    ],
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
    credentials: true,
  })
);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://audiosimplelife.web.app");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// abcs
// download

app.use("/auth", AuthRouter);

app.use("/download", DownloadRouter);

app.use("/stream", StreamRouter);

app.use("/channel", ChannelRouter);

app.use("/get-info/:videoId", (req, res, next) => {
  const videoId = req.params.videoId;
  const time = Date.now();
  Youtube.getInfo({ url: `https://www.youtube.com/watch?v=${videoId}` }).then(
    (info) => {
      res.send({ info });
    }
  );
  // ytdl
  //   .getBasicInfo(`https://www.youtube.com/watch?v=${req.params.videoId}`)
  //   .then((info) => {
  //     res.send({ time: Date.now() - time });
  //   });
});

app.listen(process.env.POST || 5000, () => {
  console.log(process.env.POST);
  console.log("server on");
  mongoose.connect(URI).then(() => {
    console.log("connected mongodb!");
  });
});
