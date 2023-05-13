const fs = require("fs");
const { dirName } = require("../path");

module.exports.createFolder = (path) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
};
