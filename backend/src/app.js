const express = require("express");

const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const taskRoutes = require("./routes/task.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);
app.use("/admin", adminRoutes);

// global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

module.exports = app;
