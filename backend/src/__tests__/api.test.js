const request = require("supertest");
const app = require("../app");
const prisma = require("../prisma");

function uniqueEmail() {
  return `user_${Date.now()}_${Math.floor(Math.random() * 10000)}@test.com`;
}

describe("Auth + Tasks + Admin", () => {
  let userToken;
  let adminToken;
  let createdTaskId;

  beforeAll(async () => {
    // login admin (seed mora postojati)
    const adminLogin = await request(app)
      .post("/auth/login")
      .send({ email: "admin@example.com", password: "Admin123!" });

    expect(adminLogin.status).toBe(200);
    adminToken = adminLogin.body.token;
    expect(adminToken).toBeTruthy();
  });

  afterAll(async () => {
    // cleanup (obriši task ako je kreiran)
    if (createdTaskId) {
      await prisma.task.deleteMany({ where: { id: createdTaskId } });
    }
    await prisma.$disconnect();
  });

  test("Health endpoint works", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test("Register + Login gives token", async () => {
    const email = uniqueEmail();
    const password = "123456";

    const reg = await request(app)
      .post("/auth/register")
      .send({ email, password, name: "Test" });

    expect(reg.status).toBe(201);
    expect(reg.body.email).toBe(email);

    const login = await request(app)
      .post("/auth/login")
      .send({ email, password });

    expect(login.status).toBe(200);
    expect(login.body.token).toBeTruthy();

    userToken = login.body.token;
  });

  test("User can create a task", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        title: "Test task",
        description: "Created from test",
        status: "TODO",
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Test task");
    expect(res.body.status).toBe("TODO");

    createdTaskId = res.body.id;
  });

  test("User can list tasks with pagination", async () => {
    const res = await request(app)
      .get("/tasks?page=1&limit=5")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.limit).toBe(5);
  });

  test("Non-admin cannot access admin routes", async () => {
    const res = await request(app)
      .get("/admin/users")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  test("Admin can access admin routes", async () => {
    const res = await request(app)
      .get("/admin/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
