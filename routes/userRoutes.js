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

router.put("/setup-info", async (req, res) => {
  const { firstName, lastName, middleName, birthDate, passDate } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Требуется авторизация." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден." });
    }

    // Обновляем поля пользователя
    user.firstName = firstName;
    user.lastName = lastName;
    user.middleName = middleName;
    user.birthDate = birthDate;
    user.passDate = passDate;

    await user.save();

    res
      .status(200)
      .json({ message: "Информация о пользователе обновлена.", user });
  } catch (error) {
    console.error("Ошибка при обновлении информации о пользователе:", error);
    res.status(500).json({ message: "Внутренняя ошибка сервера." });
  }
});

router.patch("/update-info", async (req, res) => {
  // Извлекаем данные из запроса
  const {
    firstName,
    lastName,
    middleName,
    birthDate,
    passDate,
    quote,
    bio,
    avatar,
    banner,
  } = req.body;

  // Получаем токен из заголовка
   const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Требуется авторизация." });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findByPk(decoded.id);

  if (!user) {
    return res.status(404).json({ message: "Пользователь не найден." });
  }


  // Определяем обновляемые поля
  const updateFields = {};

  if (firstName !== undefined) updateFields.firstName = firstName;
  if (lastName !== undefined) updateFields.lastName = lastName;
  if (middleName !== undefined) updateFields.middleName = middleName;
  if (birthDate !== undefined) updateFields.birthDate = birthDate;
  if (passDate !== undefined) updateFields.passDate = passDate;
  if (quote !== undefined) updateFields.quote = quote;
  if (bio !== undefined) updateFields.bio = bio;
  if (avatar !== undefined) updateFields.avatar = avatar;
  if (banner !== undefined) updateFields.banner = banner;

  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({ message: "Нет данных для обновления." });
  }

  try {
    // Обновляем данные пользователя

    await user.update(updateFields);

    // Отправляем обновленные данные пользователю

    res.status(200).json(user);
  } catch (error) {
    console.error("Ошибка при обновлении данных:", error);
    res.status(500).json({ message: "Внутренняя ошибка сервера." });
  }
});

router.get("/get-info", async (req, res) => {
  // Извлечение токена из заголовка запроса
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Предполагается, что токен передается в виде "Bearer <token>"

  if (!token) {
    return res.status(400).json({ message: "Токен не предоставлен." });
  }

  try {
    // Проверка и декодирование токена
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // Извлечение идентификатора пользователя из токена

    // Поиск пользователя в базе данных
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден." });
    }

    // Возвращаем информацию о пользователе
    res.status(200).json(user);
  } catch (error) {
    console.error("Ошибка при получении данных пользователя:", error);
    res.status(500).json({ message: "Ошибка сервера." });
  }
});

module.exports = router;
