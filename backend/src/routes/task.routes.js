const router = require("express").Router();
const { z } = require("zod");
const prisma = require("../prisma");
const auth = require("../middleware/auth");

router.use(auth);

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  dueDate: z.string().datetime().optional(),
});

router.post("/", async (req, res, next) => {
  try {
    const data = createTaskSchema.parse(req.body);

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status || "TODO",
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        userId: req.user.userId,
      },
    });

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

// GET /tasks?page=1&limit=10&status=TODO&q=abc
router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 50);
    const skip = (page - 1) * limit;

    const status = req.query.status;
    const q = (req.query.q || "").toString().trim();

    const where = {
      userId: req.user.userId,
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [total, data] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit }),
    ]);

    res.json({
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const task = await prisma.task.findFirst({
      where: { id: req.params.id, userId: req.user.userId },
    });
    if (!task) return res.status(404).json({ message: "Not found" });
    res.json(task);
  } catch (err) {
    next(err);
  }
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

router.put("/:id", async (req, res, next) => {
  try {
    const data = updateTaskSchema.parse(req.body);

    const existing = await prisma.task.findFirst({
      where: { id: req.params.id, userId: req.user.userId },
    });
    if (!existing) return res.status(404).json({ message: "Not found" });

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...("title" in data ? { title: data.title } : {}),
        ...("description" in data ? { description: data.description } : {}),
        ...("status" in data ? { status: data.status } : {}),
        ...("dueDate" in data
          ? { dueDate: data.dueDate === null ? null : new Date(data.dueDate) }
          : {}),
      },
    });

    res.json(task);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const existing = await prisma.task.findFirst({
      where: { id: req.params.id, userId: req.user.userId },
    });
    if (!existing) return res.status(404).json({ message: "Not found" });

    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
