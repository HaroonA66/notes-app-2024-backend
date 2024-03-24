//  if having issue with mongodb try to whitelist the ip address.

// I am using connection uri with my credentials but not pushed on github for security reasons.
import connectionString from "./connectionString.js";

// const connectionString = "mongodb://localhost:27017/notesDB";

import { mongoose } from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(connectionString);
    console.log(`connected to the mongodb , host: ${conn.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;
