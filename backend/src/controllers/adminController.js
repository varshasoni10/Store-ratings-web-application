const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User, Store, Rating } = require('../models');
const {
  validateName,
  validateAddress,
  validateEmail,
  validatePassword,
} = require('../utils/validators');

const SORTABLE_USER_FIELDS = ['name', 'email', 'address', 'role', 'createdAt'];
const SORTABLE_STORE_FIELDS = ['name', 'email', 'address', 'rating', 'createdAt'];

async function dashboard(req, res) {
  const [totalUsers, totalStores, totalRatings] = await Promise.all([
    User.count(),
    Store.count(),
    Rating.count(),
  ]);
  return res.json({ totalUsers, totalStores, totalRatings });
}

async function createUser(req, res) {
  const { name, email, password, address, role } = req.body;
  const allowedRoles = ['ADMIN', 'USER', 'STORE_OWNER'];
  const finalRole = allowedRoles.includes(role) ? role : 'USER';

  const errors = {};
  const nameErr = validateName(name);
  const emailErr = validateEmail(email);
  const passErr = validatePassword(password);
  const addrErr = validateAddress(address);
  if (nameErr) errors.name = nameErr;
  if (emailErr) errors.email = emailErr;
  if (passErr) errors.password = passErr;
  if (addrErr) errors.address = addrErr;
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: 'An account with this email already exists' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, address, role: finalRole });
  return res.status(201).json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, address: user.address },
  });
}

async function listUsers(req, res) {
  const { name, email, address, role, sortBy, sortOrder } = req.query;
  const where = {};
  if (name) where.name = { [Op.iLike]: `%${name}%` };
  if (email) where.email = { [Op.iLike]: `%${email}%` };
  if (address) where.address = { [Op.iLike]: `%${address}%` };
  if (role) where.role = role;

  const order = [];
  if (sortBy && SORTABLE_USER_FIELDS.includes(sortBy)) {
    order.push([sortBy, sortOrder === 'DESC' ? 'DESC' : 'ASC']);
  } else {
    order.push(['createdAt', 'DESC']);
  }

  const users = await User.findAll({
    where,
    order,
    attributes: ['id', 'name', 'email', 'address', 'role', 'createdAt'],
    include: [
      {
        model: Store,
        as: 'ownedStore',
        attributes: ['id'],
        include: [{ model: Rating, as: 'ratings', attributes: ['value'] }],
      },
    ],
  });

  const result = users.map((u) => {
    const plain = u.get({ plain: true });
    let rating = null;
    if (plain.ownedStore && plain.ownedStore.ratings && plain.ownedStore.ratings.length > 0) {
      const sum = plain.ownedStore.ratings.reduce((acc, r) => acc + r.value, 0);
      rating = Number((sum / plain.ownedStore.ratings.length).toFixed(2));
    }
    delete plain.ownedStore;
    return { ...plain, rating };
  });

  return res.json({ users: result });
}

async function getUserDetail(req, res) {
  const user = await User.findByPk(req.params.id, {
    attributes: ['id', 'name', 'email', 'address', 'role', 'createdAt'],
    include: [
      {
        model: Store,
        as: 'ownedStore',
        attributes: ['id', 'name'],
        include: [{ model: Rating, as: 'ratings', attributes: ['value'] }],
      },
    ],
  });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const plain = user.get({ plain: true });
  let rating = null;
  if (plain.ownedStore && plain.ownedStore.ratings && plain.ownedStore.ratings.length > 0) {
    const sum = plain.ownedStore.ratings.reduce((acc, r) => acc + r.value, 0);
    rating = Number((sum / plain.ownedStore.ratings.length).toFixed(2));
  }
  delete plain.ownedStore;
  return res.json({ user: { ...plain, rating } });
}

async function createStore(req, res) {
  const { name, email, address, ownerId } = req.body;

  const errors = {};
  if (!name || name.trim().length === 0 || name.length > 60) errors.name = 'Name is required (max 60 characters)';
  const emailErr = validateEmail(email);
  const addrErr = validateAddress(address);
  if (emailErr) errors.email = emailErr;
  if (addrErr) errors.address = addrErr;
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  const existing = await Store.findOne({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: 'A store with this email already exists' });
  }

  if (ownerId) {
    const owner = await User.findByPk(ownerId);
    if (!owner) return res.status(404).json({ message: 'Owner user not found' });
    if (owner.role !== 'STORE_OWNER') {
      return res.status(400).json({ message: 'Assigned owner must have the STORE_OWNER role' });
    }
    const alreadyOwns = await Store.findOne({ where: { ownerId } });
    if (alreadyOwns) {
      return res.status(409).json({ message: 'This user already owns a store' });
    }
  }

  const store = await Store.create({ name, email, address, ownerId: ownerId || null });
  return res.status(201).json({ store });
}

async function listStores(req, res) {
  const { name, email, address, sortBy, sortOrder } = req.query;
  const where = {};
  if (name) where.name = { [Op.iLike]: `%${name}%` };
  if (email) where.email = { [Op.iLike]: `%${email}%` };
  if (address) where.address = { [Op.iLike]: `%${address}%` };

  const stores = await Store.findAll({
    where,
    attributes: ['id', 'name', 'email', 'address', 'createdAt'],
    include: [{ model: Rating, as: 'ratings', attributes: ['value'] }],
  });

  let result = stores.map((s) => {
    const plain = s.get({ plain: true });
    let rating = null;
    if (plain.ratings && plain.ratings.length > 0) {
      const sum = plain.ratings.reduce((acc, r) => acc + r.value, 0);
      rating = Number((sum / plain.ratings.length).toFixed(2));
    }
    delete plain.ratings;
    return { ...plain, rating };
  });

  if (sortBy && SORTABLE_STORE_FIELDS.includes(sortBy)) {
    const dir = sortOrder === 'DESC' ? -1 : 1;
    result.sort((a, b) => {
      const av = a[sortBy] ?? '';
      const bv = b[sortBy] ?? '';
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  } else {
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return res.json({ stores: result });
}

module.exports = {
  dashboard,
  createUser,
  listUsers,
  getUserDetail,
  createStore,
  listStores,
};
