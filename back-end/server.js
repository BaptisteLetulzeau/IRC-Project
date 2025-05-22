const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
require("dotenv").config();

const PrivateMessage = require('./models/privateMessage.model');
const PublicChannel = require('./models/channel.model');
const User = require('./models/user.model');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(cors());

const connectedUsers = {};

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("🟢 Connected to MongoDB"))
  .catch((err) => console.error("🔴 MongoDB connection error:", err));

// Secret key for JWT
const SECRET_KEY = process.env.SECRET_KEY;

const authenticateToken = (req, res, next) => {
    const token = req.headers["authorization"];
    console.log(token);
    if (!token) {
      return res.status(401).json({ message: "Token manquant." });
    }
  
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Token invalide." });
      }
      req.user = user;
      next();
    });
};

app.get('/channels', async (req, res) => {
    try {
      const channels = await PublicChannel.find();
      res.json(channels);
    } 
    catch (err) {
      res.status(500).json({ message: 'Erreur lors de la récupération des canaux.' });
    }
});

app.get('/channels/:channelName/messages', async (req, res) => {
  const { channelName } = req.params;

  try {
    // Rechercher le canal par son nom
    const channel = await PublicChannel.findOne({ name: channelName });

    if (!channel) {
      return res.status(404).json({ message: 'Canal introuvable' });
    }

    // Retourner les messages triés par timestamp (ordre croissant)
    const sortedMessages = channel.messages.sort((a, b) => a.timestamp - b.timestamp);
    res.status(200).json(sortedMessages);
  } 
  catch (err) {
    console.error(`Erreur lors du chargement des messages pour le canal ${channelName}:`, err);
    res.status(500).json({ message: 'Erreur serveur lors du chargement des messages' });
  }
});

app.post('/create', async (req, res) => {
    const { name, description = "Canal sans description" } = req.body;
  
    if (!name) {
      return res.status(400).json({ error: 'Le nom du canal est requis.' });
    }
  
    try {
      // Vérifier si le canal existe déjà
      const existingChannel = await PublicChannel.findOne({ name });
      if (existingChannel) {
        return res.status(400).json({ error: 'Le canal existe déjà.' });
      }
  
      // Créer et sauvegarder un nouveau canal
      const newChannel = new PublicChannel({ name, description });
      await newChannel.save();
  
      // Réponse au client
      res.status(201).json({ message: `Canal "${name}" créé avec succès.`, channel: newChannel });
    } 
    catch (err) {
      console.error('Erreur lors de la création du canal :', err);
      res.status(500).json({ error: 'Erreur serveur. Impossible de créer le canal.' });
    }
});

app.delete('/channels/:name', async (req, res) => {
    const { name } = req.params;
  
    try {
      const result = await PublicChannel.deleteOne({ name });
  
      if (result.deletedCount > 0) {
        res.status(200).json({ message: `Le canal "${name}" a été supprimé avec succès.` });
      } else {
        res.status(404).json({ message: `Canal "${name}" non trouvé.` });
      }
    } catch (err) {
      res.status(500).json({ message: 'Erreur lors de la suppression du canal.' });
    }
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Nom d'utilisateur et mot de passe requis." });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Utilisateur déjà enregistré." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "Utilisateur créé avec succès." });
  }
  catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Erreur lors de la création de l'utilisateur." });
  }
});
  
app.post('/nick', async (req, res) => {
const { nickname, username } = req.body;

if (!nickname || nickname.trim() === '') {
    return res.status(400).json({ message: 'Le pseudo est requis.' });
}

if (!username || username.trim() === '') {
    return res.status(400).json({ message: 'Le nom d\'utilisateur est requis.' });
}

try {
    const result = await User.updateOne(
    { username },
    { $set: { username: nickname } } 
    );

    if (result.modifiedCount === 0) {
    return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    io.emit('nicknameUpdated', { oldUsername: username, newUsername: nickname });

    res.status(200).json({ message: `Nom d'utilisateur mis à jour en "${nickname}"` });
}
    catch (err) {
    console.error('Erreur lors de la mise à jour du nom d\'utilisateur:', err);

    if (err.code === 11000) {
    return res.status(400).json({ message: 'Ce pseudo est déjà utilisé.' });
    }
    res.status(500).json({ message: 'Erreur lors de la mise à jour du pseudo.' });
}
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Utilisateur non trouvé." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Mot de passe incorrect." });
    }

    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token, username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la connexion." });
  }
});

app.get('/users', async (req, res) => {
  try {
      const activeUsername = req.query.activeUserId;
      const activeUser = await User.findOne({ username: activeUsername });
      const users = await User.find({ _id: { $ne: activeUser._id } }, 'username');
      res.json(users);
  } 
  catch (err) {
      console.error('Erreur lors de la récupération des utilisateurs :', err);
      res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs.' });
  }
});

app.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: `Bienvenue, ${req.user.username}.` });
});

app.get('/messages', async (req, res) => {
    try {
      const messages = await Message.find().sort({ timestamp: -1 }).limit(50);
      res.json(messages);
    } 
    catch (err) {
      res.status(500).json({ message: 'Erreur lors de la récupération des messages.' });
    }
});

app.get('/messages/private/:userId', async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.query.currentUserId;

  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(currentUserId)) {
    return res.status(400).json({ message: 'Identifiants utilisateurs invalides' });
  }

  try {
    const messages = await PrivateMessage.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    })
      .sort({ timestamp: 1 })
      .populate('sender', 'username')
      .populate('receiver', 'username');

    res.status(200).json(messages);
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors du chargement des messages' });
  }
});

app.get('/private-messages/:senderId/:receiverId', async (req, res) => {
  const { senderId, receiverId } = req.params;

  try {
    const messages = await PrivateMessage.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    })
      .sort({ timestamp: 1 })
      .populate('sender', 'username')
      .populate('receiver', 'username');

    res.status(200).json(messages);
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des messages privés.' });
  }
});

app.post('/private-messages', async (req, res) => {
  const { sender, recipient, text } = req.body;

  if (!sender || !recipient || !text) {
    return res.status(400).json({ error: 'Champs manquants dans la requête.' });
  }

  try {
    const message = new PrivateMessage({
      sender,
      receiver: recipient,
      message: text,
    });

    await message.save();
    res.status(201).json({ message: 'Message privé envoyé avec succès.' });
  } 
  catch (error) {
    console.error('Erreur lors de l\'envoi du message privé :', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

app.post('/channels/join', async (req, res) => {
  const { channelName, activeUserId } = req.body;

  if (!channelName) {
      return res.status(400).json({ message: "Nom du canal requis." });
  }

  try {
      const channel = await PublicChannel.findOne({ name: channelName });

      if (!channel) {
          return res.status(404).json({ message: "Canal introuvable." });
      }

      const existingMember = channel.members.find(m => m.userId === activeUserId);

        if (existingMember) {
            existingMember.isJoined = true; // Réactive l'utilisateur s'il était déjà présent
        }
         else {
            channel.members.push({ userId: activeUserId, isJoined: true });
        }

        await channel.save();
        return res.status(200).json({ message: `Utilisateur ${activeUserId} ajouté au canal ${channelName}` });
  } 
  catch (err) {
      console.error("Erreur lors de la jonction du canal:", err);
      res.status(500).json({ message: "Erreur serveur." });
  }
});

app.get('/channels/hasJoined', async (req, res) => {
  const { channelName, activeUserId } = req.query;

  if (!channelName || !activeUserId) {
      return res.status(400).json({ message: "Nom du canal et ID utilisateur requis." });
  }

  try {
      const channel = await PublicChannel.findOne({ name: channelName });

      if (!channel) {
          return res.status(404).json({ message: "Canal introuvable." });
      }

      const member = channel.members.find(m => m.userId === activeUserId);

      if (member && member.isJoined) {
          return res.status(200).json({ hasJoined: true });
      } 
      else {
          return res.status(200).json({ hasJoined: false });
      }
  } 
  catch (err) {
      console.error("Erreur lors de la vérification du canal:", err);
      return res.status(500).json({ message: "Erreur serveur." });
  }
});



io.on('connection', (socket) => {
    socket.on('join', (username) => {
        connectedUsers[socket.id] = username;
        
        io.emit('connectedUsers', Object.values(connectedUsers));
    });

    socket.on('join_channel', (channel) => {
        socket.join(channel);
    
        if (!connectedUsers[channel]) {
          connectedUsers[channel] = [];
        }
        connectedUsers[channel].push(socket.id);
    
        io.to(channel).emit('user_list', connectedUsers[channel].map(id => `User-${id}`));
    });
    
    socket.on('disconnect', () => {
    const username = connectedUsers[socket.id];
    delete connectedUsers[socket.id];
    
    io.emit('connectedUsers', Object.values(connectedUsers));
    });

    socket.on('updateNickname', (nickname) => {
      console.log(`🔄 Mise à jour du pseudo pour ${socket.id}: ${nickname}`);
      socket.nickname = nickname; // Store the nickname on the socket object
      io.emit('nicknameUpdated', { id: socket.id, nickname }); // Notify everyone
    });

    socket.on('leaveChannel', async (data) => {
        const { channelName } = data;

        try {
        // Supprimer le canal de la base de données
        const result = await PublicChannel.deleteOne({ name: channelName });
        if (result.deletedCount === 0) {
            console.log(`Le canal ${channelName} n'existe pas dans la base de données.`);
            socket.emit('error', { message: `Erreur : Canal "${channelName}" non trouvé.` });
            return;
        }

        // Émettre un événement pour informer les autres utilisateurs que quelqu'un a quitté
        socket.broadcast.to(channelName).emit('userLeft', { userId: socket.id, channelName });

        // Informer le client qui a quitté le canal
        socket.emit('leftChannel', { channelName });

        // Quitter le canal en désinscrivant ce socket du canal
        socket.leave(channelName);

        // Envoi d'une confirmation à tous les clients
        io.emit('channelUpdated', { channelName, action: 'deleted' });

        } 
        catch (error) {
        console.error('Erreur lors de la suppression du canal:', error);
        socket.emit('error', { message: 'Erreur lors de la suppression du canal.' });
        }
    });

    socket.on('send_message', async (data) => {
        const { user, text, channel } = data;
        console.log(data);
    
        try {
          // Ajouter le message au canal dans la BDD
          await PublicChannel.findOneAndUpdate(
            { name: channel },
            { $push: { messages: { user, text } } },
            { new: true }
          );
    
          // Diffuser le message aux utilisateurs du canal
          io.to(channel).emit('new_message', { user, text, channel });
        } 
        catch (err) {
          console.error('Erreur lors de l\'enregistrement du message :', err);
        }
    });

    socket.on('send_private_message', async (data) => {
      try {
        const { sender, receiver, message } = data;
  
        const newMessage = await PrivateMessage.create({
          sender,
          receiver,
          message,
        });
  
        io.to(receiver).emit('receive_private_message', newMessage);
      } 
      catch (err) {
        console.error('Erreur lors de l\'envoi du message privé:', err);
      }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur en écoute sur http://localhost:${PORT}`);
});