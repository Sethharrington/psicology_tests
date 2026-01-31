const router = require("express").Router();

router.use("/contacts", require("./contactsRouter"));
router.use("/tests", require("./testsRouter"));

module.exports = router;
