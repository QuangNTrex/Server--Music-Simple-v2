const DownloadController = require("../controllers/downloads");
const router = require("express").Router();

// get => download/download
router.get("/download", DownloadController.Download);

// get => download/download-channel
// router.get("/download-channel", DownloadController.DownloadChannel);
module.exports = router;
