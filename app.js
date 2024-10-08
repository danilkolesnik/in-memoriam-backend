const express = require("express");
const path = require('path');
const cors = require("cors");
const dotenv = require("dotenv");
const { sequelize, connectDB } = require("./config/db");
const User = require("./models/User");

dotenv.config();

// Подключение к базе данных
connectDB();

// Синхронизация моделей с базой данных
sequelize.sync({ force: false }).then(() => {
  console.log("Database & tables created!");
});

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000", // Замените на домен вашего фронтенда
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware для обработки JSON
app.use(express.json());

// Определение маршрутов

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/users", require("./routes/userRoutes"));

const PORT = process.env.PORT || 3110;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
