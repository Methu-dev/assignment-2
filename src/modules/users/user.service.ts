import { query } from "../../config/database";

interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
}

export const getAllUsers = async () => {
  const result = await query(
    "SELECT id, name, email, phone, role FROM users ORDER BY id"
  );
  return result.rows;
};

export const updateUser = async (userId: number, data: UpdateUserData) => {
  //TODO: Check if user exists
  const userExists = await query("SELECT id FROM users WHERE id = $1", [
    userId,
  ]);
  if (userExists.rows.length === 0) {
    throw new Error("User not found");
  }

  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (data.name !== undefined) {
    updates.push(`name = $${paramCount}`);
    values.push(data.name);
    paramCount++;
  }

  if (data.email !== undefined) {
    updates.push(`email = $${paramCount}`);
    values.push(data.email.toLowerCase());
    paramCount++;
  }

  if (data.phone !== undefined) {
    updates.push(`phone = $${paramCount}`);
    values.push(data.phone);
    paramCount++;
  }

  if (data.role !== undefined) {
    if (!["admin", "customer"].includes(data.role)) {
      throw new Error("Invalid role");
    }
    updates.push(`role = $${paramCount}`);
    values.push(data.role);
    paramCount++;
  }

  if (updates.length === 0) {
    //TODO: return current user data if no updates
    const result = await query(
      "SELECT id, name, email, phone, role FROM users WHERE id = $1",
      [userId]
    );
    return result.rows[0];
  }

  values.push(userId);

  const result = await query(
    `UPDATE users SET ${updates.join(
      ", "
    )} WHERE id = $${paramCount} RETURNING id, name, email, phone, role`,
    values
  );

  return result.rows[0];
};

export const deleteUser = async (userId: number) => {
  //TODO: Check if user exists
  const userExists = await query("SELECT id FROM users WHERE id = $1", [
    userId,
  ]);
  if (userExists.rows.length === 0) {
    throw new Error("User not found");
  }

  //TODO: check for active bookings
  const activeBookings = await query(
    "SELECT id FROM bookings WHERE customer_id = $1 AND status = $2",
    [userId, "active"]
  );

  if (activeBookings.rows.length > 0) {
    throw new Error("User has active bookings");
  }

  await query("DELETE FROM users WHERE id = $1", [userId]);
};
