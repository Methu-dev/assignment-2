import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import * as vehicleService from "./vhicles.service";

export const createVehicle = async (req: AuthRequest, res: Response) => {
  try {
    const {
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    } = req.body;

    if (
      !vehicle_name ||
      !type ||
      !registration_number ||
      daily_rent_price === undefined ||
      !availability_status
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        errors:
          "vehicle_name, type, registration_number, daily_rent_price, and availability_status are required",
      });
    }

    if (!["car", "bike", "van", "SUV"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle type",
        errors: 'type must be "car", "bike", "van" or "SUV"',
      });
    }

    if (typeof daily_rent_price !== "number" || daily_rent_price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid daily rent price",
        errors: "daily_rent_price must be a positive number",
      });
    }

    if (!["available", "booked"].includes(availability_status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid availability status",
        errors: 'availability_status must be "available" or "booked"',
      });
    }

    const vehicle = await vehicleService.createVehicle({
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    });

    res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: vehicle,
    });
  } catch (error: any) {
    if (error.message.includes("duplicate key")) {
      return res.status(400).json({
        success: false,
        message: "Registration number already exists",
        errors: "This registration number is already in use",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create vehicle",
      errors: error.message,
    });
  }
};

export const getAllVehicles = async (req: AuthRequest, res: Response) => {
  try {
    const vehicles = await vehicleService.getAllVehicles();

    if (vehicles.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No vehicles found",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicles retrieved successfully",
      data: vehicles,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve vehicles",
      errors: error.message,
    });
  }
};

export const getVehicleById = async (req: AuthRequest, res: Response) => {
  try {
    const vehicleId = parseInt(req.params.vehicleId as any);

    const vehicle = await vehicleService.getVehicleById(vehicleId);

    res.status(200).json({
      success: true,
      message: "Vehicle retrieved successfully",
      data: vehicle,
    });
  } catch (error: any) {
    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
        errors: "Vehicle does not exist",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to retrieve vehicle",
      errors: error.message,
    });
  }
};

export const updateVehicle = async (req: AuthRequest, res: Response) => {
  try {
    const vehicleId = parseInt(req.params.vehicleId as any);
    const {
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    } = req.body;

    if (type && !["car", "bike", "van", "SUV"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle type",
        errors: 'type must be "car", "bike", "van" or "SUV"',
      });
    }

    if (
      daily_rent_price !== undefined &&
      (typeof daily_rent_price !== "number" || daily_rent_price <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid daily rent price",
        errors: "daily_rent_price must be a positive number",
      });
    }

    if (
      availability_status &&
      !["available", "booked"].includes(availability_status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid availability status",
        errors: 'availability_status must be "available" or "booked"',
      });
    }

    const vehicle = await vehicleService.updateVehicle(vehicleId, {
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    });

    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: vehicle,
    });
  } catch (error: any) {
    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
        errors: "Vehicle does not exist",
      });
    }

    if (error.message.includes("duplicate key")) {
      return res.status(400).json({
        success: false,
        message: "Registration number already exists",
        errors: "This registration number is already in use",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update vehicle",
      errors: error.message,
    });
  }
};

export const deleteVehicle = async (req: AuthRequest, res: Response) => {
  try {
    const vehicleId = parseInt(req.params.vehicleId as any);

    await vehicleService.deleteVehicle(vehicleId);

    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error: any) {
    if (error.message.includes("active bookings")) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete vehicle",
        errors: "Vehicle has active bookings",
      });
    }

    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
        errors: "Vehicle does not exist",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete vehicle",
      errors: error.message,
    });
  }
};
