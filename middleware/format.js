module.exports.formatName = (name) => {
  return name.replace(/[\\*/|?;<>]+/g, " ").replace(/\s{1,}/g, " ");
};
