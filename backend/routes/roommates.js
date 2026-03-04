const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getPosts, createPost, getMyPost, updatePost, deletePost
} = require('../controllers/roommateController');

router.get('/', getPosts);
router.get('/my', protect, authorize('student'), getMyPost);
router.post('/', protect, authorize('student'), createPost);
router.put('/:id', protect, authorize('student'), updatePost);
router.delete('/:id', protect, authorize('student'), deletePost);

module.exports = router;
