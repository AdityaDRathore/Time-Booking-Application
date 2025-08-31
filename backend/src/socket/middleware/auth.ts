import { Socket } from "socket.io";
import { verifyAccessToken } from '../../utils/jwt';
import { getUserById } from "../../services/User/user.service";
import { config } from "@src/config/environment";

export async function socketAuthMiddleware(socket: Socket, next: (err?: Error) => void) {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      console.log("⛔ No token received");
      return next(new Error("Authentication token missing"));
    }

    console.log("🧾 Received token:", token);
    console.log("🔐 Server JWT_SECRET:", config.JWT_SECRET);

    const payload = verifyAccessToken(token, config.JWT_SECRET); // ✅

    const user = await getUserById(payload.userId);
    if (!user) {
      console.log("⛔ No user found for ID:", payload.userId);
      return next(new Error("User not found"));
    }

    (socket as any).user = {
      id: user.id,
      role: user.user_role,
    };

    console.log(`✅ Authenticated user: ${user.id}, role: ${user.user_role}`);
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err);
    next(new Error("Invalid or expired token"));
  }
}
