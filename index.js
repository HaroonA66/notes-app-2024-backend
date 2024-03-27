import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import verifyAcces from "./middleware/authentication.js";
import connectDB from "./db.js";
import noteModel from "./models/note.js";

const app = express();
const PORT = 3050;

// to get params etc. in req.body
app.use(express.urlencoded({ extended: true }));

//to get json data in req.body
app.use(express.json());

// for cors origin
app.use(cors());

// mongoose.connect("mongodb://localhost:27017/notesDB").then(() => {
//   console.log("connected to the database");
// });

connectDB();

// app.get("/", (req, res) => {
//   res.send("<h1>welcome to my app.</h1>");
// });

// <====== Notes list api ======>
app.post("/getnotes", async (req, res) => {
  const { status, searchString } = req.body;

  if (status === "trash") {
    let notesList = await noteModel.find({ status: "trash" });
    res.json(notesList);
  } else {
    let notesList = await noteModel.find({ status: { $ne: "trash" } });
    res.json(notesList);
  }
});

app.post("/getnote", verifyAcces, async (req, res) => {
  const noteId = req.body.noteId;

  // Validate noteId format
  if (!mongoose.isValidObjectId(noteId)) {
    return res.status(400).send({ message: "Invalid noteId format" });
  } else {
    try {
      const requestedNote = await noteModel.findById(noteId);

      if (requestedNote) {
        res.json(requestedNote);
      } else {
        res.send({ message: "There is no record matching this ID." });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }
});

app.post("/postnote", verifyAcces, async (req, res) => {
  // const { id, title, content, create_date, edit_date } = req.body;
  // console.log(req.body);
  if (!req.body?.title || !req.body?.content) {
    res.send({ Message: "title and content should not be missing." });
  } else {
    const newNote = new noteModel({
      title: req.body?.title || "",
      content: req.body?.content || "",
      status: req.body?.status || "",
      color: req.body?.color || "",
      create_date: req.body?.create_date || "",
      edit_date: req.body?.edit_date || "",
    });
    const newResp = await newNote.save();
    res.json({ newResp });
  }
});

app.delete("/deletenote", verifyAcces, async (req, res) => {
  const noteId = req.body.noteId;

  // Validate noteId format
  if (!mongoose.isValidObjectId(noteId)) {
    return res.status(400).send({ message: "Invalid noteId format" });
  } else {
    try {
      const respAfterDelete = await noteModel.findByIdAndDelete(noteId);

      // res.json(respAfterDelete);
      if (respAfterDelete) {
        res.json({
          Message: "Record deleted successfully",
          id: respAfterDelete?._id,
        });
      } else {
        res.json({
          Message: "No record found with the provided id.",
          id: noteId,
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server listening at port: ${PORT}`);
});
