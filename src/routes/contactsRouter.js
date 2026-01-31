const router = require("express").Router();

const contactsController = require("../controllers/contactsController");
router.get("/", contactsController.getAll);
router.get("/:id", contactsController.getById);
router.post("/", contactsController.createContact);
router.put("/:id", contactsController.updateContact);
router.delete("/:id", contactsController.deleteContact);
module.exports = router;
