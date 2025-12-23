const router = require("express").Router();
const prisma = require("../prisma");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

router.use(auth);
router.use(requireRole("ADMIN"));

router.get("/users", async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

router.get("/tasks", async (req, res, next) => {
  try {
    const tasks = await prisma.task.findMany({
      include: { user: { select: { id: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
