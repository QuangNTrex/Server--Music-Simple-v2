const { google } = require("googleapis");
const ytdl = require("ytdl-core");
const Channel = require("../models/channel");
const delay = (ms) => new Promise((res) => setTimeout(res, ms));
const Youtube = require("youtube-stream-url");

let relateUpdateChannels = Date.now() + 1000 * 60 * 60 * 24 * 30;

const youtube = google.youtube({
  version: "v3",
  auth: "AIzaSyDTgn7DUpWq91xTXvQG72bDwAbKTtBwZ5s",
});

function getAllVideos(channelId, pageToken, videoIds, callback) {
  youtube.search.list(
    {
      part: "id",
      channelId: channelId,
      type: "video",
      maxResults: 50,
      pageToken: pageToken,
    },
    (err, res) => {
      if (err) callback(err, null);
      else {
        res.data.items.forEach((item) => {
          videoIds.push(item.id.videoId);
        });
        if (res.data.nextPageToken)
          getAllVideos(channelId, res.data.nextPageToken, videoIds, callback);
        else callback(null, videoIds);
      }
    }
  );
}

module.exports.postSearchChannel = (req, res, next) => {
  console.log("in postSearchChannel");
  const q = req.body.q;

  const options = {
    part: "id,snippet",
    q: q,
    maxResults: 4,
    type: "channel",
  };

  youtube.search.list(options, (err, response) => {
    if (err) {
      console.error("Error searching for channel:", err);
      res.send({ error: { message: "error" } });
    } else {
      res.send({ result: { lists: response.data.items } });
    }
  });
};

const getInfo = async (videoId) => {
  const info = await ytdl.getBasicInfo(
    `https://www.youtube.com/watch?v=${videoId}`
  );
  return {
    title: info.videoDetails.title,
    videoId,
    thumbnailUrl: info.videoDetails.thumbnails[0].url,
    lengthSeconds: Number(info.videoDetails.lengthSeconds),
    publishDate: Date.parse(info.videoDetails.publishDate),
  };
};

module.exports.postAddChannel = (req, res, next) => {
  console.log("in postAddChannel");
  const channelReq = req.body.channel;
  // Sử dụng hàm đệ quy để lấy tất cả các video của một kênh Youtube
  getAllVideos(channelReq.id.channelId, null, [], async (err, videoIds) => {
    if (err) res.send({ error: { message: `Đã xảy ra lỗi: ${err}` } });
    else {
      const startTime = Date.now();
      relateUpdateChannels = Date.now();
      let channel = await Channel.create({
        channelId: channelReq.id.channelId,
        channelTitle: channelReq.snippet.channelTitle,
        description: channelReq.snippet.description,
        thumbnail: channelReq.snippet.thumbnails.default.url,
        videoIds: videoIds,
      });
      channel = await Channel.findByIdAndUpdate(channel._id);
      let loaderVideoInfos = [];
      let cntVideoInfoLoader = 0,
        process = 0;
      const maxProcessPerOne = 100;

      for (let i = 0; i < channel.videoIds.length; i++) {
        loaderVideoInfos.push(null);
        process++;
        ytdl
          .getBasicInfo(
            `https://www.youtube.com/watch?v=${channel.videoIds[i]}`
          )
          .then((info) => {
            process--;
            loaderVideoInfos[i] = {
              title: info.videoDetails.title,
              videoId: channel.videoIds[i],
              thumbnailUrl: info.videoDetails.thumbnails[0].url,
              lengthSeconds: Number(info.videoDetails.lengthSeconds),
              publishDate: Date.parse(info.videoDetails.publishDate),
            };
            cntVideoInfoLoader++;
            console.log(cntVideoInfoLoader, i, channel.videoIds.length);
          })
          .catch((error) => {
            console.log(159, error);
            console.log(channel.videoIds[i]);
            cntVideoInfoLoader++;
            console.log(cntVideoInfoLoader);
          });
        while (process >= maxProcessPerOne) await delay(1000);
      }
      while (cntVideoInfoLoader !== channel.videoIds.length) {
        await delay(3000);
      }
      loaderVideoInfos = loaderVideoInfos.filter((vd) => !!vd);

      channel.videoDetails = loaderVideoInfos.sort((vd1, vd2) => {
        return vd1.title.localeCompare(vd2.title);
      });

      channel.save().then(() => {
        res.send({
          result: { channel, time: (Date.now() - startTime) / 1000 },
        });
      });
      // ==================================
    }
  });
};

module.exports.getAllChannel = (req, res, next) => {
  console.log("in get");
  Channel.find().then((channels) => {
    res.send({ result: { channels } });
  });
};

module.exports.getRelateUpdateChannels = (req, res, next) => {
  res.send({ result: { time: relateUpdateChannels } });
};

module.exports.getSupportReloadVideoDetail = (req, res, next) => {
  const startTime = Date.now();
  const channelId = req.params.channelId;
  Channel.findOne({ channelId }).then((channel) => {
    Channel.findByIdAndUpdate(channel._id).then(async (channel) => {
      let loaderVideoInfos = [];
      let cntVideoInfoLoader = 0,
        process = 0;
      const maxProcessPerOne = 100;

      for (let i = 0; i < channel.videoIds.length; i++) {
        loaderVideoInfos.push(null);
        process++;
        ytdl
          .getBasicInfo(
            `https://www.youtube.com/watch?v=${channel.videoIds[i]}`
          )
          .then((info) => {
            process--;
            loaderVideoInfos[i] = {
              title: info.videoDetails.title,
              videoId: channel.videoIds[i],
              thumbnailUrl: info.videoDetails.thumbnails[0].url,
              lengthSeconds: Number(info.videoDetails.lengthSeconds),
              publishDate: Date.parse(info.videoDetails.publishDate),
            };
            cntVideoInfoLoader++;
            console.log(cntVideoInfoLoader);
          })
          .catch((error) => {
            console.log(159, error);
            cntVideoInfoLoader++;
            console.log(cntVideoInfoLoader);
          });
        while (process >= maxProcessPerOne) await delay(1000);
      }

      while (cntVideoInfoLoader !== channel.videoIds.length) {
        await delay(3000);
      }

      loaderVideoInfos = loaderVideoInfos.filter((vd) => !!vd);
      channel.videoDetails = loaderVideoInfos.sort((vd1, vd2) => {
        return vd1.title.localeCompare(vd2.title);
      });

      channel.save().then(() => {
        res.send({
          result: { channel, time: (Date.now() - startTime) / 1000 },
        });
      });
    });
  });
};
