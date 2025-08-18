const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect, authorize } = require('../middlewares/auth');
const { getUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/userController');
const router = express.Router();


router.get('/', authorize('admin'), getUsers);
router.get('/:id', protect, getUserById);

router.post('/', protect, authorize('admin'), createUser);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);


module.exports = router;
