const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/auth");
const roleMiddleware = require("../middlewares/roles");

const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);

router.use(authMiddleware);

router.post("/create", roleMiddleware(['SUPERADMIN', 'ADMIN', 'UNIT_MANAGER']), userController.createUser);

router.get("/", userController.listUsers);

router.put(
  "/:id/role",
  roleMiddleware(["SUPERADMIN"]),
  userController.updateUserRole
);

router.delete(
  "/:id",
  roleMiddleware(["SUPERADMIN", "ADMIN"]),
  userController.deleteUser
);

module.exports = router;
