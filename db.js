//  if having issue with mongodb try to whitelist the ip address.

// const connectionString = "mongodb://localhost:27017/notesDB";

import { mongoose } from "mongoose";

const connectDB = async () => {
  try {
    const connectionString = process.env.DB_CON_STRING;
    // console.log("===> Connection String is: ", connectionString);
    const conn = await mongoose.connect(connectionString);
    console.log(`connected to the mongodb , host: ${conn.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;
