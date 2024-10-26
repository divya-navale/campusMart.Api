const User = require('../models/user');
const bcrypt = require('bcrypt');

// Add a new user
const addUser = async (req, res) => {
  try {
    const { name, email, studentId, password } = req.body;

    // Check if email or studentId already exists
    const existingUser = await User.findOne({ $or: [{ email }, { studentId }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email or Student ID already exists' });
    }

    // Create a new user
    const newUser = new User({
      name,
      email,
      studentId,
      password,
    });

    // Save user to the database
    await newUser.save();
    res.status(201).json({ message: 'User added successfully', user: newUser });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add user', error: err.message });
  }
};

// Delete a user by ID
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the user by ID
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
};

// Update user details by ID
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, studentId, password } = req.body;

    // Find the user by ID
    let user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's details
    user.name = name || user.name;
    user.email = email || user.email;
    user.studentId = studentId || user.studentId;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Save the updated user to the database
    await user.save();
    res.status(200).json({ message: 'User updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
};

const getUser = async (req, res) => {
  try {
    const { id, email } = req.params;

    let user;
    if (id) {
      // Find user by ID
      user = await User.findById(id);
    } else if (email) {
      // Find user by email
      user = await User.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
};


const verifyUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found', verified: false });
    }

    // Compare provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials', verified: false });
    }

    res.status(200).json({ message: 'User verified', verified: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to verify user', error: err.message, verified: false });
  }
};


module.exports = {
  addUser,
  deleteUser,
  updateUser,
  getUser,
  verifyUser
};
