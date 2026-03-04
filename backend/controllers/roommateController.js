const RoommatePost = require('../models/RoommatePost');
const { sendToUser } = require('../utils/pushNotify');

exports.getPosts = async (req, res) => {
  try {
    const { gender, area, maxBudget, lookingFor, page = 1, limit = 12 } = req.query;
    const now = new Date();

    const query = { isActive: true, expiresAt: { $gt: now } };
    if (gender && gender !== 'any') query.gender = { $in: [gender, 'any'] };
    if (lookingFor) query.lookingFor = lookingFor;
    if (maxBudget) query.budget = { $lte: Number(maxBudget) };
    if (area) query.preferredArea = { $regex: area, $options: 'i' };

    const total = await RoommatePost.countDocuments(query);
    const posts = await RoommatePost.find(query)
      .populate('student', 'name avatar department year')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, posts, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    // Deactivate any existing active post by this student
    await RoommatePost.updateMany({ student: req.user._id, isActive: true }, { isActive: false });

    const post = await RoommatePost.create({ ...req.body, student: req.user._id });
    await post.populate('student', 'name avatar department year');

    // Notify potential matches via push
    sendToUser(req.user._id, {
      title: '🤝 Roommate Post Live!',
      body: 'Your roommate listing is now visible to BWU students',
      url: '/roommates',
      tag: 'roommate-post',
    });

    res.status(201).json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyPost = async (req, res) => {
  try {
    const post = await RoommatePost.findOne({ student: req.user._id, isActive: true });
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await RoommatePost.findOneAndUpdate(
      { _id: req.params.id, student: req.user._id },
      req.body,
      { new: true }
    );
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    await RoommatePost.findOneAndUpdate(
      { _id: req.params.id, student: req.user._id },
      { isActive: false }
    );
    res.json({ success: true, message: 'Post removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
