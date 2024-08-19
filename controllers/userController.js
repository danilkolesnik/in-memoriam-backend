
const User = require("../models/User"); 

exports.getUserById = async (req, res) => {
  console.log(req.params);

  try {
    const userId = req.params.id;


    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Ошибка при получении данных пользователя:", error);
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
};
