import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import * as bookingService from "./booking.service";

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { customer_id, vehicle_id, rent_start_date, rent_end_date } =
      req.body;

    if (
      customer_id === undefined ||
      !vehicle_id ||
      !rent_start_date ||
      !rent_end_date
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        errors:
          "customer_id, vehicle_id, rent_start_date, and rent_end_date are required",
      });
    }

    const booking = await bookingService.createBooking({
      customer_id,
      vehicle_id,
      rent_start_date,
      rent_end_date,
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error: any) {
    if (error.message.includes("Vehicle not found")) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
        errors: "The specified vehicle does not exist",
      });
    }

    if (error.message.includes("not available")) {
      return res.status(400).json({
        success: false,
        message: "Vehicle not available",
        errors: "The vehicle is not available for booking",
      });
    }

    if (error.message.includes("invalid date")) {
      return res.status(400).json({
        success: false,
        message: "Invalid dates",
        errors: "rent_end_date must be after rent_start_date",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create booking",
      errors: error.message,
    });
  }
};

export const getAllBookings = async (req: AuthRequest, res: Response) => {
  try {
    let bookings;

    if (req.user?.role === "admin") {
      bookings = await bookingService.getAllBookingsAdmin();
    } else {
      bookings = await bookingService.getCustomerBookings(req.user!.id);
    }

    const message =
      req.user?.role === "admin"
        ? "Bookings retrieved successfully"
        : "Your bookings retrieved successfully";

    res.status(200).json({
      success: true,
      message,
      data: bookings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve bookings",
      errors: error.message,
    });
  }
};

export const updateBooking = async (req: AuthRequest, res: Response) => {
  try {
    const bookingId = parseInt(req.params.bookingId as any);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        errors: "status is required",
      });
    }

    if (!["active", "cancelled", "returned"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
        errors: 'status must be "active", "cancelled" or "returned"',
      });
    }

    const booking = await bookingService.updateBooking(
      bookingId,
      status,
      req.user!.role,
      req.user!.id
    );

    const message =
      status === "cancelled"
        ? "Booking cancelled successfully"
        : "Booking marked as returned. Vehicle is now available";

    res.status(200).json({
      success: true,
      message,
      data: booking,
    });
  } catch (error: any) {
    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
        errors: "Booking does not exist",
      });
    }

    if (error.message.includes("unauthorized")) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
        errors: "You can only cancel your own bookings",
      });
    }

    if (error.message.includes("cannot cancel")) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel booking",
        errors: "Booking has already started or is not active",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update booking",
      errors: error.message,
    });
  }
};
