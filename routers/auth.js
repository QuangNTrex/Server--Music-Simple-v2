const router = require("express").Router();
const AuthController = require("../controllers/auth");

// post => auth/signup, query(email, password, name);
router.post("/signup", AuthController.postSignUp);

router.post("/login", AuthController.postLogin);

module.exports = router;
