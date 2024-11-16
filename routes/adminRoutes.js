const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/dashboard', (req, res) => {

  res.render('adminDashboard');
});

router.post('/create-post', adminController.createPost);
router.post('/update-post/:id', adminController.updatePost);
router.post('/delete-post/:id', adminController.deletePost);

module.exports = router;