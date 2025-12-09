import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} from "./vhicles.controller";

const router = Router();

router.post("/", authenticate, authorize(["admin"]), createVehicle);
router.get("/:vehicleId", getVehicleById);
router.get("/", getAllVehicles);
router.put("/:vehicleId", authenticate, authorize(["admin"]), updateVehicle);
router.delete("/:vehicleId", authenticate, authorize(["admin"]), deleteVehicle);

export default router;
