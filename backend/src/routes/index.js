const express = require('express');
const wrap = require('../middleware/asyncHandler');
const { authenticate, authorize } = require('../middleware/auth');
const auth = require('../controllers/authController');
const admin = require('../controllers/adminController');
const store = require('../controllers/storeController');
const owner = require('../controllers/ownerController');

const router = express.Router();

// Auth (shared by all roles)
router.post('/auth/signup', wrap(auth.signup));
router.post('/auth/login', wrap(auth.login));
router.get('/auth/me', authenticate, wrap(auth.me));
router.put('/auth/password', authenticate, wrap(auth.updatePassword));

// System administrator
const adminOnly = [authenticate, authorize('ADMIN')];
router.get('/admin/dashboard', adminOnly, wrap(admin.dashboard));
router.get('/admin/users', adminOnly, wrap(admin.listUsers));
router.post('/admin/users', adminOnly, wrap(admin.createUser));
router.get('/admin/users/:id', adminOnly, wrap(admin.getUserDetail));
router.get('/admin/stores', adminOnly, wrap(admin.listStores));
router.post('/admin/stores', adminOnly, wrap(admin.createStore));

// Normal user
const userOnly = [authenticate, authorize('USER')];
router.get('/stores', userOnly, wrap(store.listStoresForUser));
router.put('/stores/:storeId/rating', userOnly, wrap(store.submitRating));

// Store owner
router.get('/owner/dashboard', authenticate, authorize('STORE_OWNER'), wrap(owner.ownerDashboard));

module.exports = router;
