const mongoose = require("mongoose");
const Channel = require("../models/channel.model");

describe("📌 Modèle Channel", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("✅ Devrait créer un modèle Channel", async () => {
    const channel = new Channel({
      name: "Test Channel",
      description: "Un canal de test",
      members: [],
    });

    const savedChannel = await channel.save();
    expect(savedChannel._id).toBeDefined();
    expect(savedChannel.name).toBe("Test Channel");
  });
});
