import { mongoose } from "mongoose";

const noteSchema = new mongoose.Schema({
  title: String,
  content: String,
  status: {
    type: String,
    enum: ['trash', ''], // List allowed values for status
    default: '', // Set default value to empty string
  },
  edit_date: String,
  create_date: String,
  color: String,
});

const noteModel = new mongoose.model("Note", noteSchema);

export default noteModel;
