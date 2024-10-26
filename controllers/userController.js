const User = require('../models/user');
const bcrypt = require('bcrypt');

const addUser = async (req, res) => {
  try {
    const { name, email, studentId, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { studentId }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email or Student ID already exists' });
    }

    const newUser = new User({
      name,
      email,
      studentId,
      password,
    });

    await newUser.save();
    res.status(201).json({ message: 'User added successfully', user: newUser });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add user', error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, studentId, password } = req.body;

    let user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.studentId = studentId || user.studentId;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

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
      user = await User.findById(id);
    } else if (email) {
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

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found', verified: false });
    }

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
