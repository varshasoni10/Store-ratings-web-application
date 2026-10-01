require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Store, Rating } = require('../models');

async function ensureDefaultAdmin() {
  const email = process.env.ADMIN_EMAIL;
  if (!email) return;
  const exists = await User.findOne({ where: { email } });
  if (exists) return;
  await User.create({
    name: process.env.ADMIN_NAME || 'Default System Administrator',
    email,
    password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
    address: process.env.ADMIN_ADDRESS || 'Head Office',
    role: 'ADMIN',
  });
  console.log(`Created default admin: ${email}`);
}

async function seedDemoData() {
  await sequelize.sync();
  await ensureDefaultAdmin();

  const password = await bcrypt.hash('Password@123', 10);
  const mk = (name, email, role, address) =>
    User.findOrCreate({ where: { email }, defaults: { name, email, role, address, password } }).then(([u]) => u);

  const owner1 = await mk('Rajesh Kumar Store Owner', 'owner1@example.com', 'STORE_OWNER', '12 MG Road, Bengaluru');
  const owner2 = await mk('Priya Sharma Store Owner', 'owner2@example.com', 'STORE_OWNER', '45 Park Street, Kolkata');
  const user1 = await mk('Anita Deshpande Normal User', 'user1@example.com', 'USER', '7 FC Road, Pune');
  const user2 = await mk('Vikram Singh Rathore Normal', 'user2@example.com', 'USER', '88 Marine Drive, Mumbai');

  const [s1] = await Store.findOrCreate({
    where: { email: 'freshmart@example.com' },
    defaults: { name: 'FreshMart Groceries', address: '12 MG Road, Bengaluru', ownerId: owner1.id },
  });
  const [s2] = await Store.findOrCreate({
    where: { email: 'booknook@example.com' },
    defaults: { name: 'The Book Nook', address: '45 Park Street, Kolkata', ownerId: owner2.id },
  });
  await Store.findOrCreate({
    where: { email: 'techhub@example.com' },
    defaults: { name: 'TechHub Electronics', address: '3 Connaught Place, New Delhi' },
  });

  for (const [userId, storeId, value] of [
    [user1.id, s1.id, 5],
    [user2.id, s1.id, 4],
    [user1.id, s2.id, 3],
  ]) {
    await Rating.findOrCreate({ where: { userId, storeId }, defaults: { value } });
  }

  console.log('Demo data seeded. All demo accounts use password: Password@123');
}

module.exports = { ensureDefaultAdmin };

if (require.main === module) {
  seedDemoData()
    .then(() => sequelize.close())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
