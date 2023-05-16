const router = require("express").Router();
const ChannelController = require("../controllers/channel");

// channel/search-list-channel query(q)
router.post("/search-list-channel", ChannelController.postSearchChannel);

// query(channel)
router.post("/add-channel", ChannelController.postAddChannel);

// query
router.get("/channels", ChannelController.getAllChannel);

router.get("/relate", ChannelController.getRelateUpdateChannels);

router.get(
  "/reload-video-detail/:channelId",
  ChannelController.getSupportReloadVideoDetail
);

module.exports = router;
