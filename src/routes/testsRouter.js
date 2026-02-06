const router = require("express").Router();

const testsController = require("../controllers/testsController");
const { isAuthenticated } = require("../middleware/authenticate");

router.get("/", testsController.getAll);
router.get("/:id", testsController.getById);
router.post("/", isAuthenticated, testsController.createTest);
router.put("/:id", isAuthenticated, testsController.updateTest);
router.delete("/:id", isAuthenticated, testsController.deleteTest);
module.exports = router;
