const { Store, Rating, User } = require('../models');

const SORTABLE_FIELDS = ['name', 'email', 'value', 'updatedAt'];

async function ownerDashboard(req, res) {
  const store = await Store.findOne({
    where: { ownerId: req.user.id },
    attributes: ['id', 'name', 'email', 'address'],
  });

  if (!store) {
    return res.json({ store: null, averageRating: null, raters: [] });
  }

  const { sortBy, sortOrder } = req.query;
  const ratings = await Rating.findAll({
    where: { storeId: store.id },
    attributes: ['id', 'value', 'updatedAt'],
    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'address'] }],
  });

  let raters = ratings.map((r) => ({
    ratingId: r.id,
    value: r.value,
    updatedAt: r.updatedAt,
    userId: r.user.id,
    name: r.user.name,
    email: r.user.email,
    address: r.user.address,
  }));

  if (sortBy && SORTABLE_FIELDS.includes(sortBy)) {
    const dir = sortOrder === 'DESC' ? -1 : 1;
    raters.sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return -1 * dir;
      if (a[sortBy] > b[sortBy]) return 1 * dir;
      return 0;
    });
  }

  const averageRating =
    raters.length > 0
      ? Number((raters.reduce((acc, r) => acc + r.value, 0) / raters.length).toFixed(2))
      : null;

  return res.json({ store, averageRating, raters });
}

module.exports = { ownerDashboard };
