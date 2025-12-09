import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import * as userService from "./user.service";

//TODO: get all users data ============================================================================
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await userService.getAllUsers();

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve users",
      errors: error.message,
    });
  }
};

//TODO: update user ====================================================================================
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId as any);
    const { name, email, phone, role } = req.body;

    // TODO: check role and only allow admin
    if (req.user?.role !== "admin" && req.user?.id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
        errors: "You can only update your own profile",
      });
    }

    const user = await userService.updateUser(userId, {
      name,
      email,
      phone,
      role,
    });

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error: any) {
    if (error.message.includes("duplicate key")) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
        errors: "This email is already in use",
      });
    }

    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        errors: "User does not exist",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update user",
      errors: error.message,
    });
  }
};

//TODO: delete user data (admin only acess) =====================================================================
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId as any);

    await userService.deleteUser(userId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    if (error.message.includes("active bookings")) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete user",
        errors: "User has active bookings",
      });
    }

    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        errors: "User does not exist",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      errors: error.message,
    });
  }
};
