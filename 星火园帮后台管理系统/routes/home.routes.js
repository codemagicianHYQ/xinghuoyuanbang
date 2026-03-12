// routes/home.routes.js
const express = require("express");
const router = express.Router();
const pageConfigController = require("../controllers/pageConfig.controller.js"); // Adjust path if your controller has a different name or location

// Handles GET requests to what will become /campushelper/api/v1/home/config
router.get("/config", pageConfigController.getHomePageConfig);

// If you had other /home/xxx routes, you'd add them here:
// router.get('/other-home-feature', someOtherController.getFeature);

module.exports = router;
