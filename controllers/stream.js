const ytdl = require("ytdl-core");
const fs = require("fs");
module.exports.postStreamMusic = (req, res, next) => {
  const videoId = req.params.videoId;
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const stream = ytdl(url, { filter: "audioonly", quality: "highestaudio" });

  res.set({
    "Content-Type": "audio/mpeg",
    "Transfer-Encoding": "chunked",
  });

  stream.pipe(res);

  stream.on("end", () => {
    console.log("end");
  });
};
