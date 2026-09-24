const express = require("express");

const { getDashboard } = require("./dashboardController");
const { requireAuth } = require("../../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth);

router.get("/", getDashboard);

module.exports = router;