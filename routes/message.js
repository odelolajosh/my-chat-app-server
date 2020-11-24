const router = require("express").Router();
const ctrl = require("../controllers/message");
const auth = require("../config/auth-config");

router.post("/", ctrl.getAllMessagesByUsers);

module.exports = router;