import { IncomingMessage, ServerResponse } from "http";
import { parse } from "url";
import { users, addUser, getUserById, updateUser, deleteUser } from "./db";
import dotenv from "dotenv";

dotenv.config();

export const handleRequest = (req: IncomingMessage, res: ServerResponse) => {
  const url = parse(req.url || "", true);
  const path = url.pathname;
  const method = req.method;

  if (path === "/api/users" && method === "GET") {
    // GET all users
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(users));
  } else if (path?.startsWith("/api/users/") && method === "GET") {
    // GET specific user by ID
    const userId = path.split("/").pop();
    if (!userId || !isValidUUID(userId)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid userId" }));
      return;
    }
    const user = getUserById(userId);
    if (!user) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "User not found" }));
    } else {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(user));
    }
  } else if (path === "/api/users" && method === "POST") {
    // POST to create a new user
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const { username, age, hobbies } = JSON.parse(body);
        if (!username || typeof age !== "number" || !Array.isArray(hobbies)) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Missing required fields" }));
          return;
        }
        const newUser = addUser({ username, age, hobbies });
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(newUser));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal Server Error" }));
      }
    });
  } else if (path?.startsWith("/api/users/") && method === "PUT") {
    // PUT to update an existing user
    const userId = path.split("/").pop();
    if (!userId || !isValidUUID(userId)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid userId" }));
      return;
    }

    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const user = updateUser(userId, JSON.parse(body));
        if (!user) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "User not found" }));
        } else {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(user));
        }
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal Server Error" }));
      }
    });
  } else if (path?.startsWith("/api/users/") && method === "DELETE") {
    // DELETE a user
    const userId = path.split("/").pop();
    if (!userId || !isValidUUID(userId)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid userId" }));
      return;
    }

    const deleted = deleteUser(userId);
    if (!deleted) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "User not found" }));
    } else {
      res.writeHead(204);
      res.end();
    }
  } else {
    // Handle non-existing routes
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Resource not found" }));
  }
};

// Utility function to validate UUID
const isValidUUID = (uuid: string) => {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89ab][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
    uuid
  );
};
