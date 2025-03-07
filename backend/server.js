// server.js - Express backend for attendance system
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { spawn } = require('child_process'); // Add this for Python integration
const path = require('path');
const fs = require('fs');


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

// Helper function to call Python face recognition service
const callPythonFaceService = (method, imageData, studentId) => {
  return new Promise((resolve, reject) => {
    // Create a temporary file to store the image data
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    
    const imagePath = path.join(tempDir, `${Date.now()}.jpg`);
    fs.writeFileSync(imagePath, Buffer.from(imageData, 'base64'));
    
    // Spawn Python process
    const pythonProcess = spawn('python', [
      path.join(__dirname, 'face_service_cli.py'), // Python script to call our FaceRecognitionService
      method, // 'register' or 'recognize'
      imagePath,
      studentId || ''
    ]);
    
    let resultData = '';
    let errorData = '';
    
    // Collect data from Python script
    pythonProcess.stdout.on('data', (data) => {
      resultData += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
    });
    
    // Handle process completion
    pythonProcess.on('close', (code) => {
      // Clean up temporary file
      try {
        fs.unlinkSync(imagePath);
      } catch (err) {
        console.error('Error removing temp file:', err);
      }
      
      if (code === 0) {
        try {
          const result = JSON.parse(resultData);
          resolve(result);
        } catch (err) {
          reject(new Error(`Failed to parse Python result: ${resultData}`));
        }
      } else {
        reject(new Error(`Python process exited with code ${code}: ${errorData}`));
      }
    });
  });
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
    
    // Call Python face recognition service
    try {
      const result = await callPythonFaceService('register', faceData, req.user.userId);
      
      if (result.success) {
        // Update user with face data
        await User.findByIdAndUpdate(req.user.userId, { faceData: Buffer.from(faceData, 'base64') });
        res.json({ message: 'Face data registered successfully' });
      } else {
        res.status(400).json({ message: result.message || 'Face registration failed' });
      }
    } catch (pythonError) {
      console.error('Python service error:', pythonError);
      res.status(500).json({ message: 'Error processing face data', error: pythonError.message });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error registering face data', error: error.message });
  }
});

// Verify attendance with face recognition
app.post('/api/attendance/verify-face', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can verify with face recognition' });
    }
    
    const { faceData, courseId, teacherId, location } = req.body;
    
    if (!faceData || !courseId || !teacherId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Call Python face recognition service
    try {
      const result = await callPythonFaceService('recognize', faceData, req.user.userId);
      
      if (result.success && result.student_id === req.user.userId) {
        // Create attendance record
        const attendance = new Attendance({
          studentId: req.user.userId,
          teacherId,
          courseId,
          status: 'present',
          verificationMethod: 'face+proximity',
          location,
        });
        
        await attendance.save();
        
        res.status(201).json({
          message: 'Attendance verified and recorded successfully',
          attendanceId: attendance._id,
          confidence: result.confidence
        });
      } else {
        res.status(401).json({ 
          message: 'Face verification failed', 
          details: result.message || 'Face did not match registered data'
        });
      }
    } catch (pythonError) {
      console.error('Python service error:', pythonError);
      res.status(500).json({ message: 'Error processing face data', error: pythonError.message });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error verifying attendance', error: error.message });
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
// In server.js, add this route:
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Connection successful',
    timestamp: new Date().toISOString(),
    serverAddress: req.connection.localAddress
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    server: 'ClassCheck API',
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});
// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});