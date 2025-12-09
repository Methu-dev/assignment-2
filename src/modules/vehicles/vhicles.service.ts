import { query } from "../../config/database";

interface VehicleData {
  vehicle_name?: string;
  type?: string;
  registration_number?: string;
  daily_rent_price?: number;
  availability_status?: string;
}

//TODO: create new vehicle ===============================================================================
export const createVehicle = async (data: VehicleData) => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = data;

  const result = await query(
    "INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status) VALUES ($1, $2, $3, $4, $5) RETURNING id, vehicle_name, type, registration_number, daily_rent_price, availability_status",
    [
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    ]
  );

  return result.rows[0];
};

//TODO: get all vehicle details ============================================================================
export const getAllVehicles = async () => {
  const result = await query(
    "SELECT id, vehicle_name, type, registration_number, daily_rent_price, availability_status FROM vehicles ORDER BY id"
  );
  return result.rows;
};

export const getVehicleById = async (vehicleId: number) => {
  const result = await query(
    "SELECT id, vehicle_name, type, registration_number, daily_rent_price, availability_status FROM vehicles WHERE id = $1",
    [vehicleId]
  );

  if (result.rows.length === 0) {
    throw new Error("Vehicle not found");
  }

  return result.rows[0];
};

//TODO: update vehicle data ====================================================================================
export const updateVehicle = async (vehicleId: number, data: VehicleData) => {
  const vehicleExists = await query("SELECT id FROM vehicles WHERE id = $1", [
    vehicleId,
  ]);
  if (vehicleExists.rows.length === 0) {
    throw new Error("Vehicle not found");
  }

  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (data.vehicle_name !== undefined) {
    updates.push(`vehicle_name = $${paramCount}`);
    values.push(data.vehicle_name);
    paramCount++;
  }

  if (data.type !== undefined) {
    updates.push(`type = $${paramCount}`);
    values.push(data.type);
    paramCount++;
  }

  if (data.registration_number !== undefined) {
    updates.push(`registration_number = $${paramCount}`);
    values.push(data.registration_number);
    paramCount++;
  }

  if (data.daily_rent_price !== undefined) {
    updates.push(`daily_rent_price = $${paramCount}`);
    values.push(data.daily_rent_price);
    paramCount++;
  }

  if (data.availability_status !== undefined) {
    updates.push(`availability_status = $${paramCount}`);
    values.push(data.availability_status);
    paramCount++;
  }

  if (updates.length === 0) {
    //* Return current vehicle data if no updates ===========================
    const result = await query(
      "SELECT id, vehicle_name, type, registration_number, daily_rent_price, availability_status FROM vehicles WHERE id = $1",
      [vehicleId]
    );
    return result.rows[0];
  }

  values.push(vehicleId);

  const result = await query(
    `UPDATE vehicles SET ${updates.join(
      ", "
    )} WHERE id = $${paramCount} RETURNING id, vehicle_name, type, registration_number, daily_rent_price, availability_status`,
    values
  );

  return result.rows[0];
};

//TODO: delete vehicle and prevent it if it has active booking ==========================================================
export const deleteVehicle = async (vehicleId: number) => {
  const vehicleExists = await query("SELECT id FROM vehicles WHERE id = $1", [
    vehicleId,
  ]);
  if (vehicleExists.rows.length === 0) {
    throw new Error("Vehicle not found");
  }

  const activeBookings = await query(
    "SELECT id FROM bookings WHERE vehicle_id = $1 AND status = $2",
    [vehicleId, "active"]
  );

  if (activeBookings.rows.length > 0) {
    throw new Error("Vehicle has active bookings");
  }

  await query("DELETE FROM vehicles WHERE id = $1", [vehicleId]);
};
