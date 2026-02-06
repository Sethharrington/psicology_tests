const passport = require("passport");

const router = require("express").Router();

router.use("/contacts", require("./contactsRouter"));
router.use("/tests", require("./testsRouter"));
router.get("/login", passport.authenticate("github"), (req, res) => {
  res.send("");
});

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  });
});
module.exports = router;
