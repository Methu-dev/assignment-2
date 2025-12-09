import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { getAllUsers, updateUser, deleteUser } from "./user.controller";

const router = Router();

router.get("/", authenticate, authorize(["admin"]), getAllUsers);
router.put("/:userId", authenticate, updateUser);
router.delete("/:userId", authenticate, authorize(["admin"]), deleteUser);

export default router;
