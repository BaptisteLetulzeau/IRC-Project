const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app'); // Assurez-vous que votre Express app est bien exportée
const PublicChannel = require('../models/PublicChannel'); // Importation du modèle

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

it("✅ Devrait récupérer la liste des canaux", async () => {
    const res = await request(app).get("/api/channels");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
});

it("✅ Devrait récupérer un canal par ID", async () => {
    const res = await request(app).get(`/api/channels/${channelId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(channelId);
});

it("✅ Devrait supprimer un canal", async () => {
    const res = await request(app).delete(`/api/channels/${channelId}`);
    expect(res.statusCode).toBe(200);
});

describe('GET /user-channels/:username', () => {
  beforeEach(async () => {
    await PublicChannel.deleteMany();

    // Insérer des canaux de test
    await PublicChannel.create([
      {
        name: 'channel1',
        description: 'Canal de test 1',
        messages: [],
        members: [{ userId: 'user1', isJoined: true }]
      },
      {
        name: 'channel2',
        description: 'Canal de test 2',
        messages: [],
        members: [{ userId: 'user2', isJoined: true }]
      },
      {
        name: 'channel3',
        description: 'Canal de test 3',
        messages: [],
        members: [{ userId: 'user1', isJoined: true }]
      }
    ]);
  });

  it('🔹 Devrait retourner les canaux auxquels user1 appartient', async () => {
    const response = await request(app).get('/user-channels/user1');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2); // user1 est dans 2 canaux
    expect(response.body[0]).toHaveProperty('name');
    expect(response.body[0]).toHaveProperty('members');
    expect(response.body.some(channel => channel.name === 'channel1')).toBe(true);
    expect(response.body.some(channel => channel.name === 'channel3')).toBe(true);
  });

  it('🔹 Devrait retourner un tableau vide si l’utilisateur n’a rejoint aucun canal', async () => {
    const response = await request(app).get('/user-channels/nonexistentUser');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]); // Aucun canal trouvé
  });

  it('🔹 Devrait gérer les erreurs serveur', async () => {
    jest.spyOn(PublicChannel, 'find').mockImplementation(() => {
      throw new Error('Erreur de test');
    });

    const response = await request(app).get('/user-channels/user1');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message', 'Erreur lors de la récupération des canaux de l’utilisateur.');
  });
});
