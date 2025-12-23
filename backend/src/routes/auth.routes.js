const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const prisma = require("../prisma");
const auth = require("../middleware/auth");

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).optional(),
  password: z.string().min(6),
});

router.post("/register", async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return res.status(409).json({ message: "Email already used" });

    const hashed = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: { email: data.email, name: data.name, password: hashed, role: "USER" },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(data.password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    next(err);
  }
});

router.get("/me", auth, async (req, res, next) => {
  try {
    const me = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    res.json(me);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
