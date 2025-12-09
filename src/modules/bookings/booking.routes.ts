import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { createBooking, getAllBookings, updateBooking } from "./booking.controller";

const router = Router();

router.post("/", authenticate, authorize(["admin", "customer"]), createBooking);
router.get("/", authenticate, getAllBookings);
router.put("/:bookingId", authenticate, updateBooking);

export default router;
