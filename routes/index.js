const express = require('express');
const router = express.Router();

router,get("/", (req, res, next) => {
    res.status(400).send({ response: " I'm alive" })
})

module.exports = router;