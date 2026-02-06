const router = require("express").Router();

const contactsController = require("../controllers/contactsController");
const { isAuthenticated } = require("../middleware/authenticate");

router.get("/", contactsController.getAll);
router.get("/:id", contactsController.getById);
router.post("/", isAuthenticated, contactsController.createContact);
router.put("/:id", isAuthenticated, contactsController.updateContact);
router.delete("/:id", isAuthenticated, contactsController.deleteContact);
module.exports = router;
