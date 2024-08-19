const express = require("express");
const CryptoJS = require("crypto-js");
const { uuid } = require("uuidv4");
const path = require("path");
const mime = require("mime-types");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
const upload = require("../config/multerConfig");
const fs = require("fs");
const userController = require("../controllers/userController");

const SECRET_KEY = "h5v7y9z^&*b2!@1c3$kq#u@9e$%x6l1";

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
//   // Извлечение токена из заголовка запроса
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1]; // Предполагается, что токен передается в виде "Bearer <token>"

//   if (!token) {
//     return res.status(400).json({ message: "Токен не предоставлен." });
//   }

//   try {
//     // Проверка и декодирование токена
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const userId = decoded.id; // Извлечение идентификатора пользователя из токена

//     // Поиск пользователя в базе данных
//     const user = await User.findByPk(userId);
//     if (!user) {
//       return res.status(404).json({ message: "Пользователь не найден." });
//     }

//     // Возвращаем информацию о пользователе
//     res.status(200).json(user);
//   } catch (error) {
//     console.error("Ошибка при получении данных пользователя:", error);
//     res.status(500).json({ message: "Ошибка сервера." });
//   }
// });

router.get("/users/:id", userController.getUserById);

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
    isPrivate,
  } = req.body;

  
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Требуется авторизация." });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findByPk(decoded.id);

  if (!user) {
    return res.status(404).json({ message: "Пользователь не найден." });
  }

  
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
  if (isPrivate !== undefined) updateFields.isPrivate = isPrivate;

  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({ message: "Нет данных для обновления." });
  }

  try {
    

    await user.update(updateFields);


    res.status(200).json(user);
  } catch (error) {
    console.error("Ошибка при обновлении данных:", error);
    res.status(500).json({ message: "Внутренняя ошибка сервера." });
  }
});

router.post("/upload-avatar", upload.single("avatar"), async (req, res) => {
  try {
    const avatarPath = req.file.path;

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Требуется авторизация." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден." });
    }

    user.avatar = avatarPath;
    await user.save();

    res
      .status(200)
      .json({ message: "Аватар загружен успешно.", avatar: avatarPath });
  } catch (error) {
    console.error("Ошибка при загрузке аватара:", error);
    res.status(500).json({ message: "Внутренняя ошибка сервера." });
  }
});

router.post("/upload-banner", upload.single("banner"), async (req, res) => {
  try {
    const bannerPath = req.file.path;

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Требуется авторизация." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден." });
    }

    user.banner = bannerPath;
    await user.save();

    res
      .status(200)
      .json({ message: "Баннер загружен успешно.", banner: bannerPath });
  } catch (error) {
    console.error("Ошибка при загрузке баннера:", error);
    res.status(500).json({ message: "Внутренняя ошибка сервера." });
  }
});

router.post("/upload-media", upload.single("media"), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "Файл не загружен" });
  }

  try {

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Требуется авторизация." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);


    const mediaId = uuid();
    const mediaUrl = `uploads/${file.filename}`;

    const mimeType = mime.lookup(file.originalname);
    let mediaType;

    if (mimeType.startsWith("image/")) {
      mediaType = "photo";
    } else if (mimeType.startsWith("video/")) {
      mediaType = "video";
    } else {
      return res.status(400).json({ message: "Неподдерживаемый тип файла." });
    }

    const mediaItem = { id: mediaId, url: mediaUrl, type: mediaType };
    const updatedMedia = [...(user.media || []), mediaItem];
    user.media = updatedMedia;

    await user.save();

    res.status(200).json({ mediaId, mediaUrl, mediaType });
  } catch (error) {
    console.error("Ошибка при загрузке медиафайла:", error);
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
});

router.delete("/delete-media/:userId/:mediaId", async (req, res) => {
  const { userId, mediaId } = req.params;

  try {
    const user = await User.findByPk(userId);
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    const mediaItem = user.media.find((item) => item.id === mediaId);
    if (!mediaItem) {
      return res.status(404).json({ message: "Медиафайл не найден" });
    }

    const filePath = path.join(
      __dirname,
      "../uploads",
      path.basename(mediaItem.url)
    );
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Ошибка при удалении файла:", err);
        return res.status(500).json({ message: "Ошибка при удалении файла" });
      }
    });

    user.media = user.media.filter((item) => item.id !== mediaId);
    await user.save();

    res.status(200).json({ message: "Медиафайл успешно удален" });
  } catch (error) {
    console.error("Ошибка при удалении медиафайла:", error);
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
});

module.exports = router;
