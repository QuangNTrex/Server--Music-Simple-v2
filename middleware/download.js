const ytdl = require("ytdl-core");
const fs = require("fs");
const { createFolder } = require("../middleware/file");
const { musicFolder, videoFolder } = require("../path");
const { formatName } = require("../middleware/format");

module.exports.DownloadFn = (req, res, videoId, system, format, quality) => {
  ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`).then((info) => {
    let title = formatName(info.videoDetails.title),
      channelName = formatName(info.videoDetails.ownerChannelName),
      filePathAudio =
        (format === "mp3" ? musicFolder : videoFolder) +
        "/" +
        channelName +
        "/" +
        title +
        "." +
        format;

    if (!title || title.includes("#shorts")) return 0;
    if (format === "mp3") createFolder(musicFolder + "/" + channelName);
    else createFolder(videoFolder + "/" + channelName);

    let stream = ytdl.downloadFromInfo(info, {
      format: format,
      quality: quality,
    });

    if (system === "server") {
      stream.pipe(fs.createWriteStream(filePathAudio));
    } else {
      // else save in client
      res.set({
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(
          title + "." + format
        )}`,
        "Content-Type": format === "mp3" ? "audio/mpeg" : "video/mp4",
      });
      stream.pipe(res);
    }

    return 1;
  });
};

module.exports.DownloadMp3 = (res, videoId) => {
  ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`).then((info) => {
    let title = formatName(info.videoDetails.title);
    // if (!title || title.includes("#shorts")) return 0;

    let stream = ytdl.downloadFromInfo(info, {
      format: "mp3",
      quality: "highestaudio",
    });

    res.set({
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(
        title + ".mp3"
      )}`,
      "Content-Type": "audio/mpeg",
    });
    stream.pipe(res);
  });
};
