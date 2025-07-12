import { Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "./event.types";
import { getRoleRoom, getUserRoom } from "../utils/roomNames";

// Strongly typed socket
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export function registerNotificationEvents(socket: TypedSocket) {
  socket.on("send:notification", (data: { title: any; message: any; }) => {
    const { title, message } = data;
    console.log("🔔 Notification received:", data);

    // Emit back to sender
    socket.emit("notification:new", { title, message });

    // Emit to all users in the same role room (e.g., all STUDENTs)
    socket.to(getRoleRoom("USER")).emit("notification:new", {
      title,
      message,
    });

    // Example: target a specific user (if needed)
    // socket.to(getUserRoom("some-user-id")).emit("notification:new", { title, message });
  });
}
