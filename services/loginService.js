const bcrypt = require('bcryptjs');
const User = require('../models/userSchema');

// ----------- Register User -----------
const register = async (details) => {
  const { username, email, password, confirm_password } = details;

  if (password !== confirm_password) {
    return { success: false, message: 'Passwords do not match' };
  }

  // Check if username or email already exists
  const existingUser = await User.findOne({
    $or: [{ username }, { email }]
  });
  if (existingUser) {
    return { success: false, message: 'Username or email already exists' };
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  // Create new user
  const newUser = new User({
    username,
    email,
    password: hashedPassword
  });

  await newUser.save();
  return { success: true, message: 'Signup successful!' };
};


// ----------- Login User -----------
const login = async (details) => {
  const { email, password } = details;

  const user = await User.findOne({ email });
  if (!user) {
    return { success: false, message: 'Invalid email or password' };
  }
  const isMatch = await bcrypt.compare(password, user.password.toString());
  if (!isMatch) {
    return { success: false, message: 'Invalid email or password' };
  }
  
  return {
    success: true,
    message: 'Login successful',
    username: user.username,
    email: user.email
  };
};


const logout = async (req) => {
  return new Promise((resolve, reject) => {
    req.session.destroy(err => {
      if (err) {
        return reject({ success: false, message: 'Logout failed', error: err });
      }
      resolve({ success: true, message: 'Logged out successfully!' });
    });
  });
};


module.exports = {
  login,
  register,
  logout
};
