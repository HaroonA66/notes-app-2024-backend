import { mongoose } from "mongoose";

const noteSchema = new mongoose.Schema({
  title: String,
  content: String,
  edit_date: String,
  create_date: String,
});

const noteModel = new mongoose.model("Note", noteSchema);

export default noteModel;
