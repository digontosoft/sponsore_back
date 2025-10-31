const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  grade: {
    type: String
  },
  marks: {
    type: Number
  }
});

const progressReportSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  reportDate: {
    type: Date,
    default: Date.now
  },
  semester: {
    type: String,
    required: true
  },
  subjects: [subjectSchema],
  overallGrade: {
    type: String
  },
  overallPercentage: {
    type: Number
  },
  attendance: {
    type: Number
  },
  teacherComments: {
    type: String
  },
  achievements: [{
    type: String
  }],
  challenges: {
    type: String
  },
  goals: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ProgressReport', progressReportSchema);

