//  if having issue with mongodb try to whitelist the ip address.

const connectionString =
  "mongodb+srv://realharoon66:hm1212@cluster0.rex39e2.mongodb.net/notesDB?retryWrites=true&w=majority&appName=Cluster0";
//  "mongodb://localhost:27017/notesDB";

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
