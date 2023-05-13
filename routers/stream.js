const router = require("express").Router();
const StreamController = require("../controllers/stream");

// stream/music/:videoId
router.get("/music/:videoId", StreamController.postStreamMusic);

module.exports = router;
