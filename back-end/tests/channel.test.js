const request = require("supertest");
const app = require("../server"); // Assurez-vous que l'export est bien fait dans server.js
const mongoose = require("mongoose");
const Channel = require("../models/channel.model");

describe("📌 API Channels", () => {
  let channelId;

  beforeAll(async () => {
    await Channel.deleteMany();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("✅ Devrait créer un nouveau canal", async () => {
    const res = await request(app).post("/api/channels").send({
      name: "test-channel",
      description: "Canal de test",
      members: [],
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe("test-channel");
    channelId = res.body._id;
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
});
