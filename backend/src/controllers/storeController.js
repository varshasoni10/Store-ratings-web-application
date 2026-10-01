const { Op } = require('sequelize');
const { Store, Rating } = require('../models');
const { validateRating } = require('../utils/validators');

const SORTABLE_FIELDS = ['name', 'address', 'rating'];

// Normal user: browse stores with own rating + overall rating
async function listStoresForUser(req, res) {
  const { name, address, sortBy, sortOrder } = req.query;
  const where = {};
  if (name) where.name = { [Op.iLike]: `%${name}%` };
  if (address) where.address = { [Op.iLike]: `%${address}%` };

  const stores = await Store.findAll({
    where,
    attributes: ['id', 'name', 'email', 'address'],
    include: [{ model: Rating, as: 'ratings', attributes: ['value', 'userId'] }],
  });

  let result = stores.map((s) => {
    const plain = s.get({ plain: true });
    let overallRating = null;
    if (plain.ratings && plain.ratings.length > 0) {
      const sum = plain.ratings.reduce((acc, r) => acc + r.value, 0);
      overallRating = Number((sum / plain.ratings.length).toFixed(2));
    }
    const mine = plain.ratings.find((r) => r.userId === req.user.id);
    delete plain.ratings;
    return { ...plain, overallRating, myRating: mine ? mine.value : null };
  });

  if (sortBy && SORTABLE_FIELDS.includes(sortBy)) {
    const dir = sortOrder === 'DESC' ? -1 : 1;
    result.sort((a, b) => {
      const key = sortBy === 'rating' ? 'overallRating' : sortBy;
      const av = a[key] ?? '';
      const bv = b[key] ?? '';
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  } else {
    result.sort((a, b) => a.name.localeCompare(b.name));
  }

  return res.json({ stores: result });
}

async function submitRating(req, res) {
  const storeId = Number(req.params.storeId);
  const { value } = req.body;

  const ratingErr = validateRating(value);
  if (ratingErr) {
    return res.status(400).json({ message: 'Validation failed', errors: { value: ratingErr } });
  }

  const store = await Store.findByPk(storeId);
  if (!store) return res.status(404).json({ message: 'Store not found' });

  const [rating, created] = await Rating.findOrCreate({
    where: { userId: req.user.id, storeId },
    defaults: { value: Number(value) },
  });

  if (!created) {
    rating.value = Number(value);
    await rating.save();
  }

  return res.status(created ? 201 : 200).json({ rating });
}

module.exports = { listStoresForUser, submitRating };
