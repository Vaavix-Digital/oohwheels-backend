require("dotenv").config();
const http = require("http");
const app = require("../src/app");

const socket = {
  _writableState: {},
  writable: true,
  on: () => {},
  once: () => {},
  emit: () => {},
  write: () => true,
  end: () => {},
  destroy: () => {},
};

const req = new http.IncomingMessage(socket);
req.method = "GET";
req.url = "/api/v1/health";
req.headers = { host: "localhost" };

const res = new http.ServerResponse(req);
let responseData = "";

// Capture write and end
const originalWrite = res.write.bind(res);
const originalEnd = res.end.bind(res);

res.write = function (chunk, ...args) {
  if (chunk) responseData += chunk.toString();
  return originalWrite(chunk, ...args);
};

res.end = function (chunk, ...args) {
  if (chunk) responseData += chunk.toString();
  try {
    const json = JSON.parse(responseData);
    console.log("Health check result:", json);
    if (json.success && json.message === "OohWheels API is running") {
      console.log("✅ API Health Check test passed successfully!");
      process.exit(0);
    } else {
      console.error("❌ Unexpected response:", json);
      process.exit(1);
    }
  } catch (e) {
    console.error("Error parsing response:", responseData, e);
    process.exit(1);
  }
};

app.handle(req, res);
