const express = require('express');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');
const User = require('./models/user');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
const qrcode = require('qrcode');
const axios = require('axios');  

const app = express();


dotenv.config();


const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.set('view engine', 'ejs');


app.use(express.static(path.join(__dirname)));


app.use(express.urlencoded({ extended: true }));


app.use(session({
  secret: process.env.SESSION_SECRET,  
  resave: false,
  saveUninitialized: true,
}));


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS,  
  },
});


app.get('/user/register', (req, res) => {
  res.render('register');
});


app.post('/user/register', async (req, res) => {
  const { email, username, password, firstName, lastName, age, gender } = req.body;


  if (!email || !username || !password || !firstName || !lastName || !age || !gender) {
    return res.status(400).send('All fields are required.');
  }


  const hashedPassword = await bcrypt.hash(password, 10);


  const user = new User({
    email,
    username,
    password: hashedPassword,
    firstName,
    lastName,
    age,
    gender,
  });

  try {
 
    await user.save();

  
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,  
      subject: 'Welcome to our platform',
      text: `Hello ${firstName},\n\nWelcome to our platform! We're thrilled to have you with us.\n\nBest Regards, Amina`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Welcome email sent:', info.response);
      }
    });


    res.redirect('/user/login');
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).send('An error occurred while registering the user.');
  }
});


app.get('/user/login', (req, res) => {
  res.render('login');  
});


app.post('/user/login', async (req, res) => {
  const { username, password, twoFactorCode } = req.body;

  const user = await User.findOne({ username });

  if (!user) {
    return res.send('User not found');
  }


  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    return res.send('Invalid password');
  }


  if (user.isTwoFactorEnabled) {
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: twoFactorCode,
    });

    if (!verified) {
      return res.send('Invalid 2FA code');
    }
  }


  req.session.userId = user._id;
  res.redirect('/');  
});


app.get('/user/enable-2fa', (req, res) => {
  const secret = speakeasy.generateSecret();
  req.session.twoFactorSecret = secret.base32;  

  qrcode.toDataURL(secret.otpauth_url, (err, dataUrl) => {
    if (err) {
      console.error('Error generating QR code:', err);
      return res.send('Error generating QR code.');
    }
    res.render('enable-2fa', { qrCodeUrl: dataUrl }); 
  });
});


app.post('/user/enable-2fa', (req, res) => {
  const { twoFactorCode } = req.body;
  const secret = req.session.twoFactorSecret;  


  const verified = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token: twoFactorCode,
  });

  if (verified) {
  
    User.findByIdAndUpdate(req.session.userId, {
      isTwoFactorEnabled: true,
      twoFactorSecret: secret,
    }, (err, user) => {
      if (err) {
        console.error('Error updating user for 2FA:', err);
        return res.send('Error enabling 2FA.');
      }
      res.redirect('/');  
    });
  } else {
    res.send('Invalid 2FA code');
  }
});


async function fetchStockData() {
  try {
    const response = await axios.get(`https://www.alphavantage.co/query`, {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol: 'AAPL',  
        apikey: process.env.ALPHA_VANTAGE_API_KEY,
      },
    });
    console.log('Stock data response:', response.data);
    return response.data['Time Series (Daily)'];
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return null;
  }
}


async function fetchNewsData() {
  try {
    const response = await axios.get(`https://newsapi.org/v2/top-headlines`, {
      params: {
        country: 'us',
        apiKey: process.env.NEWS_API_KEY,
      },
    });
    return response.data.articles;
  } catch (error) {
    console.error('Error fetching news data:', error);
    return [];
  }
}

app.get('/', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/user/login');  
  }
  const stockData = await fetchStockData();
  const newsData = await fetchNewsData();

  
  const user = await User.findById(req.session.userId);

  res.render('dashboard', {
    user,
    stockData,
    newsData,
  });
});


app.get('/admin', async (req, res) => {
  const users = await User.find(); 
  res.render('admin-dashboard', { users });
});


app.post('/admin/add-user', async (req, res) => {
  const { email, username, role } = req.body;

  const user = new User({
    email,
    username,
    password: await bcrypt.hash('defaultpassword', 10), 
    role,
  });

  await user.save();
  res.redirect('/admin');
});

app.get('/admin/delete-user/:id', async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndDelete(id);
  res.redirect('/admin');
});


app.get('/user/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/user/login');  
  });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});