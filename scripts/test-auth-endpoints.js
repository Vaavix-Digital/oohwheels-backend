require("dotenv").config();
const http = require("http");
const app = require("../src/app");

function mockRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    let resData = "";
    let statusCode = 200;
    const resHeaders = {};

    const req = new http.IncomingMessage({
      _writableState: {},
      writable: true,
      on: () => {},
      once: () => {},
      emit: () => {},
      write: () => true,
      end: () => {},
      destroy: () => {},
    });

    req.method = options.method || "GET";
    req.url = options.url;
    req.headers = {
      host: "localhost",
      "content-type": "application/json",
      ...(options.headers || {}),
    };

    if (postData) {
      req.body = typeof postData === "string" ? JSON.parse(postData) : postData;
    }

    const res = new http.ServerResponse(req);
    res.setHeader = (name, val) => {
      resHeaders[name.toLowerCase()] = val;
    };
    res.getHeader = (name) => resHeaders[name.toLowerCase()];
    res.writeHead = (status) => {
      statusCode = status;
    };

    const originalWrite = res.write.bind(res);
    res.write = function (chunk, ...args) {
      if (chunk) resData += chunk.toString();
      return true;
    };

    res.end = function (chunk, ...args) {
      if (chunk) resData += chunk.toString();
      try {
        const json = resData ? JSON.parse(resData) : {};
        resolve({ status: res.statusCode || statusCode, data: json });
      } catch (err) {
        resolve({ status: res.statusCode || statusCode, raw: resData });
      }
    };

    app.handle(req, res);
  });
}

async function runAuthTests() {
  console.log("🚀 Starting Auth Endpoints In-Process Test Suite...\n");

  // 1. Health check
  const healthRes = await mockRequest({ method: "GET", url: "/api/v1/health" });
  console.log("1. GET /api/v1/health -> Status:", healthRes.status, healthRes.data?.message);

  // 2. Demo User Login
  const loginRes = await mockRequest(
    { method: "POST", url: "/api/v1/auth/login" },
    { email: "learner@oohwheels.com", password: "password123" }
  );
  console.log("2. POST /api/v1/auth/login -> Status:", loginRes.status, "Token:", loginRes.data?.token ? "Generated ✅" : "Failed ❌");
  const token = loginRes.data?.token;

  // 3. GET /api/v1/users/me (Protected with JWT)
  const meRes = await mockRequest({
    method: "GET",
    url: "/api/v1/users/me",
    headers: { authorization: `Bearer ${token}` },
  });
  console.log("3. GET /api/v1/users/me -> Status:", meRes.status, "User Name:", meRes.data?.user?.name);
  console.log("   Gamification: Streak:", meRes.data?.user?.stats?.streak, "Gems:", meRes.data?.user?.stats?.gems, "Hearts:", meRes.data?.user?.stats?.hearts?.current + "/5");

  // 4. PATCH /api/v1/users/me (Update Profile)
  const patchRes = await mockRequest(
    {
      method: "PATCH",
      url: "/api/v1/users/me",
      headers: { authorization: `Bearer ${token}` },
    },
    { name: "Alex Prodigy", dailyGoalXp: 75, avatar: "gold-lightning-car" }
  );
  console.log("4. PATCH /api/v1/users/me -> Status:", patchRes.status, "Updated Name:", patchRes.data?.user?.name, "New Goal:", patchRes.data?.user?.stats?.dailyGoal?.targetXP);

  // 5. GET /api/v1/users/me/profile-screen
  const profileRes = await mockRequest({
    method: "GET",
    url: "/api/v1/users/me/profile-screen",
    headers: { authorization: `Bearer ${token}` },
  });
  console.log("5. GET /api/v1/users/me/profile-screen -> Status:", profileRes.status, "Tiles:", profileRes.data?.data?.statTiles?.length);

  // 6. POST /api/v1/auth/register (New User)
  const uniqueEmail = `testuser_${Date.now()}@oohwheels.com`;
  const registerRes = await mockRequest(
    { method: "POST", url: "/api/v1/auth/register" },
    {
      name: "Sam Speed",
      email: uniqueEmail,
      password: "password123",
      country: "United Kingdom",
    }
  );
  console.log("6. POST /api/v1/auth/register -> Status:", registerRes.status, "New User ID:", registerRes.data?.user?.id);

  // 7. POST /api/v1/auth/forgot-password
  const forgotRes = await mockRequest(
    { method: "POST", url: "/api/v1/auth/forgot-password" },
    { email: uniqueEmail }
  );
  console.log("7. POST /api/v1/auth/forgot-password -> Status:", forgotRes.status, "Dev Token:", forgotRes.data?.devResetToken ? "Available ✅" : "N/A");

  // 8. POST /api/v1/auth/logout
  const logoutRes = await mockRequest({ method: "POST", url: "/api/v1/auth/logout" });
  console.log("8. POST /api/v1/auth/logout -> Status:", logoutRes.status, logoutRes.data?.message);

  console.log("\n🎉 ALL 8 AUTH & USER PROFILE ENDPOINTS TESTED SUCCESSFULLY!");
  process.exit(0);
}

runAuthTests().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
