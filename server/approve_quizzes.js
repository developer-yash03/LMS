const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Quiz = require('./models/Quiz');

async function approveQuizzes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const result = await Quiz.updateMany({ status: 'pending' }, { $set: { status: 'approved' } });
    console.log(`Quizzes approved: ${result.modifiedCount}`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

approveQuizzes();
