const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { signToken } = require('../utils/jwt');
const {
  validateName,
  validateAddress,
  validateEmail,
  validatePassword,
} = require('../utils/validators');

async function signup(req, res) {
  const { name, email, password, address } = req.body;

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
  const user = await User.create({
    name,
    email,
    password: hashed,
    address,
    role: 'USER',
  });

  const token = signToken(user);
  return res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, address: user.address },
  });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = signToken(user);
  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, address: user.address },
  });
}

async function updatePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const passErr = validatePassword(newPassword);
  if (passErr) {
    return res.status(400).json({ message: 'Validation failed', errors: { newPassword: passErr } });
  }

  const user = await User.findByPk(req.user.id);
  const match = await bcrypt.compare(currentPassword || '', user.password);
  if (!match) {
    return res.status(401).json({ message: 'Current password is incorrect' });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  return res.json({ message: 'Password updated successfully' });
}

async function me(req, res) {
  const { id, name, email, role, address } = req.user;
  return res.json({ user: { id, name, email, role, address } });
}

module.exports = { signup, login, updatePassword, me };
