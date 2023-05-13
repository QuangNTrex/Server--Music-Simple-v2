const Users = require("../models/user");
const bcrypt = require("bcrypt");
const salt = 12;

module.exports.postSignUp = (req, res, next) => {
  const email = req.query.email;
  const password = req.query.password;
  const name = req.query.name;

  // check email empty
  Users.findOne({ email })
    .then((user) => {
      if (user) return res.send({ error: { message: "email is empty!" } });

      bcrypt
        .hash(password, salt)
        .then((hash) => {
          Users.create({ email, password: hash, name })
            .then(() => {
              res.send({ result: { message: "success!" } });
            })
            .catch((err) => next(err));
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
};

module.exports.postLogin = (req, res, next) => {
  const email = req.query.email;
  const password = req.query.password;

  // check email empty
  Users.findOne({ email })
    .then((user) => {
      if (!user) return res.send({ error: { message: "email is incorrect!" } });

      bcrypt
        .compare(password, user.password)
        .then((result) => {
          if (result) {
            req.session.user = user;
            return res.send({
              result: {
                message: "login success!",
                isUser: true,
                isAdmin: user.isAdmin,
                email: user.email,
                name: user.name,
              },
            });
          } else
            return res.send({ error: { message: "password is incorrect!" } });
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
};
