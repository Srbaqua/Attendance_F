// server.js - Express backend for attendance system
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Models
const User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['teacher', 'student'], required: true },
  faceData: { type: Buffer }, // For students only
  registrationDate: { type: Date, default: Date.now },
}));

const Attendance = mongoose.model('Attendance', new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: String, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['present', 'absent'], required: true },
  verificationMethod: { type: String, enum: ['face+proximity', 'manual', 'other'], required: true },
  location: { type: String },
}));

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Routes
// User registration
app.post('/api/users/register', async (req, res) => {
  try {
    const { username, password, name, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const user = new User({
      username,
      password: hashedPassword,
      name,
      role,
    });
    
    await user.save();
    
    res.status(201).json({
      message: 'User registered successfully',
      userId: user._id,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// User login
app.post('/api/users/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
});

// Register face data
app.post('/api/students/register-face', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can register face data' });
    }
    
    const { faceData } = req.body;
    if (!faceData) {
      return res.status(400).json({ message: 'Face data is required' });
    }
    
    // Update user with face data
    await User.findByIdAndUpdate(req.user.userId, { faceData: Buffer.from(faceData, 'base64') });
    
    res.json({ message: 'Face data registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering face data', error: error.message });
  }
});

// Mark attendance
app.post('/api/attendance/mark', authenticate, async (req, res) => {
  try {
    const { studentId, courseId, status, verificationMethod, location } = req.body;
    
    if (req.user.role === 'student' && req.user.userId !== studentId) {
      return res.status(403).json({ message: 'Students can only mark their own attendance' });
    }
    
    const teacherId = req.user.role === 'teacher' ? req.user.userId : req.body.teacherId;
    
    // Create new attendance record
    const attendance = new Attendance({
      studentId,
      teacherId,
      courseId,
      date: new Date(),
      status,
      verificationMethod,
      location,
    });
    
    await attendance.save();
    
    res.status(201).json({
      message: 'Attendance marked successfully',
      attendanceId: attendance._id,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error marking attendance', error: error.message });
  }
});

// Get attendance history
app.get('/api/attendance/history', authenticate, async (req, res) => {
  try {
    const { courseId, startDate, endDate } = req.query;
    
    const query = {};
    
    if (courseId) {
      query.courseId = courseId;
    }
    
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    
    if (req.user.role === 'student') {
      query.studentId = req.user.userId;
    } else if (req.user.role === 'teacher') {
      query.teacherId = req.user.userId;
    }
    
    const attendanceRecords = await Attendance.find(query)
      .populate('studentId', 'name username')
      .populate('teacherId', 'name username')
      .sort({ date: -1 });
    
    res.json(attendanceRecords);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance history', error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});