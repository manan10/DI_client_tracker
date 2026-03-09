const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../.env') });

const admins = [
  {
    name: "Uday A. Dalal",
    username: "uad24",
    email: "udaydalal24@gmail.com",
    password: "Uday111@" 
  },
  {
    name: "Manan Dalal",
    username: "mud10",
    email: "manandalal101998@gmail.com",
    password: "Uday111@"
  },
  {
    name: "Aman Dalal",
    username: "aud28",
    email: "aman2805@gmail.com",
    password: "Uday111@"
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    await User.deleteMany({ username: { $in: admins.map(a => a.username) } });

    for (let admin of admins) {
      await User.create(admin);
      console.log(`Admin Created: ${admin.username}`);
    }

    console.log("Seeding Success.");
    process.exit();
  } catch (error) {
    console.error("Seeding Failed:", error);
    process.exit(1);
  }
};

seedDB();