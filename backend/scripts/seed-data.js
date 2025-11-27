// scripts/seed-data.js
// Run: node scripts/seed-data.js
const mongooseConfig = require('../src/config/mongoose');
const Profile = require('../src/models/Profile.model');

async function seed() {
  try {
    await mongooseConfig.connect();

    const data = [
      { name: 'Admin User', email: 'admin@gmail.com', role: 'admin', timezone: 'Asia/Kolkata' },
      { name: 'user 1', email: 'user1@gmail.com', role: 'user', timezone: 'America/New_York' },
      { name: 'User 2', email: 'user2@gmail.com', role: 'user', timezone: 'Europe/London' },
    ];

    for (const p of data) {
      const exists = await Profile.findOne({ email: p.email });
      if (!exists) {
        const created = new Profile(p);
        await created.save();
        console.log('Created:', created._id.toString(), p.email);
      } else {
        console.log('Exists:', exists._id.toString(), p.email);
      }
    }

    console.log('Seeding done');
    await mongooseConfig.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed', err);
    process.exit(1);
  }
}

seed();
