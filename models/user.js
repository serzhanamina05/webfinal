const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,  
    unique: true,    
  },
  username: {
    type: String,
    required: true,
    unique: true,    
  },
  password: {
    type: String,
    required: true,
  },
  firstName: String,
  lastName: String,
  age: Number,
  gender: String,
  isTwoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  twoFactorSecret: String,
  role: {
    type: String,
    enum: ['user', 'admin'], 
    default: 'user',          
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;