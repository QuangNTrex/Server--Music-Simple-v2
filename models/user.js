const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  audioLoves: [
    {
      lengthSeconds: { type: Number },
      thumbnailUrl: { type: String, required: true },
      title: { type: String, required: true },
      videoId: { type: String, required: true },
      publishDate: { type: Date },
    },
  ],
});

const Users = mongoose.model("User", UserSchema);

module.exports = Users;
