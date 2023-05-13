const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChannelSchema = new Schema({
  channelId: { type: String, required: true },
  channelTitle: { type: String, required: true },
  description: { type: String },
  thumbnail: { type: String, required: true },
  timeCreatedAt: { type: Date, required: true, default: Date.now() },
  videoIds: [{ type: String }],
  videoDetails: [
    {
      lengthSeconds: { type: Number },
      thumbnailUrl: { type: String, required: true },
      title: { type: String, required: true },
      videoId: { type: String, required: true },
      publishDate: { type: Date },
      love: {type: Boolean, default: false},
    },
  ],
});

const Channel = mongoose.model("Channel", ChannelSchema);

module.exports = Channel;
