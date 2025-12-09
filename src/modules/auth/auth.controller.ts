import { Request, Response } from "express";
import * as authService from "./auth.service";

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        errors: "name, email, password, phone, and role are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password validation failed",
        errors: "Password must be at least 6 characters",
      });
    }

    if (!["admin", "customer"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
        errors: 'Role must be "admin" or "customer"',
      });
    }

    const user = await authService.registerUser({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error: any) {
    if (error.message.includes("duplicate key")) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
        errors: "This email is already registered",
      });
    }

    res.status(500).json({
      success: false,
      message: "Signup failed",
      errors: error.message,
    });
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        errors: "email and password are required",
      });
    }

    const result = await authService.loginUser(email.toLowerCase(), password);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: "Login failed",
      errors: error.message,
    });
  }
};
