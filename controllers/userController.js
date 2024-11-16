const bcrypt = require('bcryptjs');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const { sendWelcomeEmail } = require('../utils/emailHelper');

exports.register = async (req, res) => {
  const { username, password, email } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({ username, email, password: hashedPassword });
  await newUser.save();

  sendWelcomeEmail(email);
  res.redirect('/user/login');
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && await user.comparePassword(password)) {
    req.session.user = user;
    res.redirect('/user/dashboard');
  } else {
    res.send('Invalid login credentials');
  }
};