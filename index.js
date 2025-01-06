import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import verifyAcces from "./middleware/authentication.js";
import connectDB from "./db.js";
import noteModel from "./models/note.js";
import "dotenv/config";

const app = express();
const PORT = 3050;

// for cors origin
// Restrict to specific origin
const corsOptions = {
  origin: ["http://localhost:3000", "https://notes-app-2024.vercel.app"], // Replace with your frontend's deployed URL
  methods: ["GET", "POST", "DELETE", "PUT"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

// to get params etc. in req.body
app.use(express.urlencoded({ extended: true }));

//to get json data in req.body
app.use(express.json());

// Add explicit CORS handling if needed
app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://notes-app-2024.vercel.app"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).end(); // Preflight response
  }
  next();
});

connectDB();

app.get("/", (req, res) => {
  res.send("Backend Server For Notes app 2024 by Haroon.");
});

// <====== Notes list api ======>

app.post("/getnotes", verifyAcces, async (req, res) => {
  const { status, searchString } = req.body;

  let query = { status: { $ne: "deleted" } }; // Start with a base query excluding deleted notes

  // If status is trash, include only trashed notes
  if (status === "trash") {
    query = { status: "trash" };
  } else if (status === "all") {
    query = {};
  } else if (status === "deleted") {
    query = { status: "deleted" };
  } else {
    query = {
      $and: [{ status: { $ne: "trash" } }, { status: { $ne: "deleted" } }],
    };
  }

  // If searchString is provided, add search conditions for title and content
  if (searchString) {
    const searchRegex = new RegExp(searchString, "i"); // Case-insensitive regex for searchString
    query.$or = [
      { title: { $regex: searchRegex } },
      { content: { $regex: searchRegex } },
    ];
  }

  try {
    const notesList = await noteModel.find(query);
    res.json(notesList);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching notes" });
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

  if (req?.body?._id) {
    try {
      // Find the note by ID
      const existingNote = await noteModel.findById(req.body._id);
      const updatedNote = await noteModel.findByIdAndUpdate(
        req.body._id, // ID of the document to update
        {
          title: req.body?.title || existingNote?.title,
          content: req.body?.content || existingNote?.content,
          status:
            req.body.status || req.body.status === ""
              ? req.body.status
              : existingNote?.status,
          color: req.body?.color || existingNote?.color,
          edit_date:
            req.body?.title !== existingNote.title ||
            req.body?.content !== existingNote.title
              ? new Date()
              : existingNote?.edit_date, // Update the edit date
        },
        { new: true } // Return the updated document
      );

      res.json(updatedNote);
    } catch (error) {
      res.status(500).json({ error: "Error updating note." });
    }
  } else {
    if (!req.body?.title || !req.body?.content) {
      res.send({ Message: "title and content should not be missing." });
    } else {
      const newNote = new noteModel({
        title: req.body?.title || "",
        content: req.body?.content || "",
        status: req.body?.status || "",
        color: req.body?.color || "",
        create_date: new Date(),
        edit_date: req.body?.edit_date || "",
      });

      try {
        const newResp = await newNote.save();
        res.json(newResp);
      } catch (error) {
        res.status(500).json({ error: "Error saving new note." });
      }
    }
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
