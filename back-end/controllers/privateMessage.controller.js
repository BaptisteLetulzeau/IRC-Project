const PrivateMessage = require("./privateMessage.model");

exports.sendMessage = async (req, res) => {
  try {
    const { receiver, message } = req.body;
    const sender = req.user.id;

    const newMessage = new PrivateMessage({ sender, receiver, message });
    await newMessage.save();

    req.io.to(receiver).emit("privateMessage", newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de l'envoi du message", error });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user.id;

    const messages = await PrivateMessage.find({
      $or: [
        { sender: currentUser, receiver: userId },
        { sender: userId, receiver: currentUser },
      ],
    }).sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des messages", error });
  }
};
