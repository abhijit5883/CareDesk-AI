const express = require("express");
const {
  signup,
  login,
  getCurrentAdmin,
  logout,
} = require("./authController");

const { requireAuth } = require("../../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", requireAuth, getCurrentAdmin);
router.post("/logout", logout);

module.exports = router;