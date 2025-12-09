import { query } from "../../config/database";

interface CreateBookingData {
  customer_id: number;
  vehicle_id: number;
  rent_start_date: string;
  rent_end_date: string;
}

//** Create booking ================================================================ */
export const createBooking = async (data: CreateBookingData) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = data;

  //TODO: validate dates
  const startDate = new Date(rent_start_date);
  const endDate = new Date(rent_end_date);

  if (endDate <= startDate) {
    throw new Error(
      "Invalid dates: rent_end_date must be after rent_start_date"
    );
  }

  //TODO:  check vehicle exists and is available
  const vehicleResult = await query(
    "SELECT daily_rent_price, availability_status FROM vehicles WHERE id = $1",
    [vehicle_id]
  );

  if (vehicleResult.rows.length === 0) {
    throw new Error("Vehicle not found");
  }

  const vehicle = vehicleResult.rows[0];

  if (vehicle.availability_status !== "available") {
    throw new Error("Vehicle not available for booking");
  }

  //TODO: Calculate total price
  const daysOfRent = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const totalPrice = daysOfRent * parseFloat(vehicle.daily_rent_price);

  // TODO: finaly create boooking
  const bookingResult = await query(
    "INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status",
    [
      customer_id,
      vehicle_id,
      rent_start_date,
      rent_end_date,
      totalPrice,
      "active",
    ]
  );

  const booking = bookingResult.rows[0];

  //TODO: Update vehicle status to booked
  await query("UPDATE vehicles SET availability_status = $1 WHERE id = $2", [
    "booked",
    vehicle_id,
  ]);

  //TODO: Get vehicle data for response
  const vehicleDetailsResult = await query(
    "SELECT vehicle_name, daily_rent_price FROM vehicles WHERE id = $1",
    [vehicle_id]
  );

  return {
    ...booking,
    vehicle: vehicleDetailsResult.rows[0],
  };
};

//** Get booking records (admin) ================================================= */
export const getAllBookingsAdmin = async () => {
  const result = await query(`
    SELECT 
      b.id, b.customer_id, b.vehicle_id, b.rent_start_date, b.rent_end_date, 
      b.total_price, b.status,
      json_build_object('name', u.name, 'email', u.email) as customer,
      json_build_object('vehicle_name', v.vehicle_name, 'registration_number', v.registration_number) as vehicle
    FROM bookings b
    JOIN users u ON b.customer_id = u.id
    JOIN vehicles v ON b.vehicle_id = v.id
    ORDER BY b.id
  `);
  return result.rows;
};

//** Get bookings of customer ================================================= */
export const getCustomerBookings = async (customerId: number) => {
  const result = await query(
    `
    SELECT 
      b.id, b.vehicle_id, b.rent_start_date, b.rent_end_date, 
      b.total_price, b.status,
      json_build_object('vehicle_name', v.vehicle_name, 'registration_number', v.registration_number, 'type', v.type) as vehicle
    FROM bookings b
    JOIN vehicles v ON b.vehicle_id = v.id
    WHERE b.customer_id = $1
    ORDER BY b.id
  `,
    [customerId]
  );
  return result.rows;
};

//** Update booking ================================================================ */
export const updateBooking = async (
  bookingId: number,
  status: string,
  userRole: string,
  userId: number
) => {
  //TODO: check if booking exists
  const bookingResult = await query("SELECT * FROM bookings WHERE id = $1", [
    bookingId,
  ]);

  if (bookingResult.rows.length === 0) {
    throw new Error("Booking not found");
  }

  const booking = bookingResult.rows[0];

  if (status === "cancelled") {
    //TODO: Make sure only customer can cancel their own booking and only before start date
    if (userRole !== "admin" && booking.customer_id !== userId) {
      throw new Error("Unauthorized: You can only cancel your own bookings");
    }

    if (booking.status !== "active") {
      throw new Error("Cannot cancel: Booking is not active");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(booking.rent_start_date);

    if (today >= startDate) {
      throw new Error("Cannot cancel: Booking has already started");
    }

    //TODO: update booking to cancelled
    const updatedResult = await query(
      "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status",
      ["cancelled", bookingId]
    );

    //TODO: update vehicle back to available
    await query("UPDATE vehicles SET availability_status = $1 WHERE id = $2", [
      "available",
      booking.vehicle_id,
    ]);

    return updatedResult.rows[0];
  } else if (status === "returned") {

    //TODO: Make sure only admin can mark as returned
    if (userRole !== "admin") {
      throw new Error("Unauthorized: Only admin can mark bookings as returned");
    }

    if (booking.status !== "active") {
      throw new Error("Cannot mark as returned: Booking is not active");
    }

    //TODO: update booking to returned
    const updatedResult = await query(
      "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status",
      ["returned", bookingId]
    );

    //TODO: update vehicle back to available
    const vehicleUpdateResult = await query(
      "UPDATE vehicles SET availability_status = $1 WHERE id = $2 RETURNING availability_status",
      ["available", booking.vehicle_id]
    );

    return {
      ...updatedResult.rows[0],
      vehicle: {
        availability_status: vehicleUpdateResult.rows[0].availability_status,
      },
    };
  } else {
    throw new Error("Invalid status for update");
  }
};
