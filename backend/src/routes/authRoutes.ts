import express from "express";
import authorize from "../middleware/authorizeMiddleware";
import { signup } from "../controllers/signupController";
import { me, signin } from "../controllers/signinController";
import authenticate from "../middleware/authMiddleware";

const router = express.Router();

router.post("/signup", signup);

router.post("/signin", signin);

router.get("/me", me);

router.get("/admin-data", authenticate, authorize("admin"), (req, res) => {
  res.json({ message: "This is admin data" });
});

router.get(
  "/editor-data",
  authenticate,
  authorize("admin", "editor"),
  (req, res) => {
    res.json({ message: "This is editor or admin data" });
  },
);

export default router;
