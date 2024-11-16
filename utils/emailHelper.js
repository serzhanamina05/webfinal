const nodemailer = require('nodemailer');

exports.sendWelcomeEmail = (email) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASS }
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Welcome to the Platform',
    text: 'Thank you for registering with us!'
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) console.log(err);
    else console.log(info);
  });
};