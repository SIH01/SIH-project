const express = require("express");
const router = express.Router();
const { register, login, adminLogin, organizationLogin } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/admin-login", adminLogin);
router.post("/organization-login", organizationLogin);

module.exports = router;
