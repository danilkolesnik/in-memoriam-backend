const express = require("express");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Подключаем модель пользователя
const router = express.Router();

const SECRET_KEY = "h5v7y9z^&*b2!@1c3$kq#u@9e$%x6l1"; // Ключ для дешифрования

// Вход в систему
router.post("/login", async (req, res) => {
  console.log(req.body);
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).json({ message: "Логин и пароль обязательны." });
  }

  try {
    // Найти пользователя по login
    const user = await User.findOne({ where: { login } });
    if (!user) {
      return res.status(401).json({ message: "Неверный логин или пароль." });
    }

    // Дешифровать хранящийся зашифрованный пароль
    const decryptedPassword = CryptoJS.AES.decrypt(
      password,
      SECRET_KEY
    ).toString(CryptoJS.enc.Utf8);

    // Проверить пароль
    if (decryptedPassword !== user.password) {
      return res.status(401).json({ message: "Неверный логин или пароль." });
    }

    // Генерация токена
    const token = jwt.sign(
      { id: user.id, login: user.login },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h", // Токен истекает через 1 час
      }
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        login: user.login,
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: user.middleName,
      },
    });
  } catch (error) {
    console.error("Ошибка при входе:", error);
    res.status(500).json({ message: "Внутренняя ошибка сервера." });
  }
});

module.exports = router;
