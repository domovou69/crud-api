import http from "http";
import dotenv from "dotenv";
import { handleRequest } from "./userHandlers";
dotenv.config();

const PORT = process.env.PORT || 4000;

http.createServer(handleRequest).listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
