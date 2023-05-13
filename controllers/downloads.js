const ytdl = require("ytdl-core");
const fs = require("fs");

const { DownloadFn, DownloadMp3 } = require("../middleware/download");
const urlSearch = "https://www.googleapis.com/youtube/v3/search?";
const key = process.env.KEY;

function createYtbApi(query) {
  let arr = Object.entries(query);
  let url = urlSearch;
  arr.forEach((e, i) => {
    url += e[0] + "=" + e[1] + (i === arr.length - 1 ? "" : "&");
  });
  console.log(url);
}

module.exports.Download = (req, res) => {
  const videoId = req.query.videoId;
  DownloadMp3(res, videoId);
};

module.exports.DownloadChannel = async (req, res) => {
  const system = req.query.system || "server";
  const format = req.query.format || "mp4";
  const quality = req.query.quality || "highest";
  const videoId = req.query.videoId;
  ytdl
    .getBasicInfo(`https://www.youtube.com/watch?v=${videoId}`)
    .then(async (info) => {
      let channelId = info.videoDetails.channelId;
      console.log(channelId);
      let fullUrl = createYtbApi({
        urlSearch: urlSearch,
        channelId: channelId,
        key: key,
        type: "video",
        maxResults: "50",
      });

      let stop = false;
      let nextPageToken;
      let cnt = 0;
      let hasError = false;
      while (!stop) {
        const res = await fetch(
          fullUrl + (!!nextPageToken ? "&pageToken=" + nextPageToken : "")
        );
        const data = await res.json();
        // check token
        if (data.error) {
          hasError = true;
          return res.send({ message: "token hết hạn rồi :>" });
        } else {
          const obj = JSON.parse(fs.readFileSync(root + "/data/count.json"));
          obj.count++;
          // if (obj.count === 6) return;
          fs.writeFileSync(root + "/data/count.json", JSON.stringify(obj));
        }
        stop = !data.nextPageToken;
        nextPageToken = data.nextPageToken;
        console.log(nextPageToken);
        for (let item of data.items) {
          cnt += DownloadFn(req, res, item.id.videoId, system, format, quality);
          await delay(500);
        }
      }

      console.log("ends");
      if (system === "server" && !hasError)
        res.send({ completed: true, total: cnt });
    });
};
