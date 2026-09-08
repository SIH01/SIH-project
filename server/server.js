require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const disasterRoutes = require("./routes/disasterRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", stage: 3 });
});

app.use("/api/auth", authRoutes);
app.use("/api/disasters", disasterRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`DisasterShield API running on http://localhost:${PORT}`);
});