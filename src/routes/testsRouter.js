const router = require("express").Router();

const testsController = require("../controllers/testsController");
router.get("/", testsController.getAll);
router.get("/:id", testsController.getById);
router.post("/", testsController.createTest);
router.put("/:id", testsController.updateTest);
router.delete("/:id", testsController.deleteTest);
module.exports = router;
