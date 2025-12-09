import express from "express";
import { globalErrorHandler } from "../middleware/globalError";
import authRoutes from "../modules/auth/auth.routes";
import userRoutes from "../modules/users/user.routes";
import vehicleRoutes from "../modules/vehicles/vhicles.routes";
import bookingRoutes from "../modules/bookings/booking.routes";

const app = express();


app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/vehicles", vehicleRoutes);
app.use("/api/v1/bookings", bookingRoutes);


app.use(globalErrorHandler);

export default app;
