module.exports.isUser = (req, res, next) => {
  if (req.session.user) return next();
  return res.send({ error: { message: "is not auth" } });
};
module.exports.isAdmin = (req, res, next) => {
  if (req.session.isAdmin) return next();
  return res.send({ error: { message: "is not admin" } });
};
