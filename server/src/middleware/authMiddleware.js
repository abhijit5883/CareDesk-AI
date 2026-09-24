
const { verifyToken } = require("../modules/authentication/authService");

function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const decoded = verifyToken(token);

    req.adminId = decoded.adminId;
    req.clinicId = decoded.clinicId;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired authentication token",
    });
  }
}

module.exports = {
  requireAuth,
};