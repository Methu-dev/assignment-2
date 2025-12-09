import { query } from "../../config/database";
import { hashPassword, comparePassword } from "../../utils/password";
import { generateToken } from "../../utils/jwt";

interface UserData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: string;
}

export const registerUser = async (userData: UserData) => {
  const { name, email, password, phone, role } = userData;
  const hashedPassword = await hashPassword(password);

  const result = await query(
    "INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, role",
    [name, email, hashedPassword, phone, role]
  );

  return result.rows[0];
};

export const loginUser = async (email: string, password: string) => {
  const result = await query("SELECT * FROM users WHERE email = $1", [email]);

  if (result.rows.length === 0) {
    throw new Error("Invalid email or password");
  }

  const user = result.rows[0];
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  };
};
