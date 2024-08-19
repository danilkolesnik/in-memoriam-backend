// userController.js

const User = require("../models/User"); // Путь к вашей модели пользователя

// Функция для получения данных пользователя по ID
exports.getUserById = async (req, res) => {
  console.log(req.params);

  try {
    const userId = req.params.id;

    // Найти пользователя по ID
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    // Вернуть данные пользователя
    res.status(200).json(user);
  } catch (error) {
    console.error("Ошибка при получении данных пользователя:", error);
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
};
