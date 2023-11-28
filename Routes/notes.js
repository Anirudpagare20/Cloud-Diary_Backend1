const express = require("express");
const fetchuser = require("../Middleware/fetchuser");
const router = express.Router();
const Note = require("../models/Note");
const { validationResult, body } = require("express-validator");

//ROUTE:1 = Get All The NOtes Using : GET: '/api/notes/fetchallnotes/' **LOGIN REQUIRED**
router.get("/fetchallnotes", fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes); // Directly send the array of notes
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});


//ROUTE:2 = Add a Note  Using : POSt: '/api/notes/addnote/' **LOGIN REQUIRED**
router.post(
    "/addnote",
    fetchuser,
    [
        // Validators for Notes Adding
        body("title", "Enter a Valid title").isLength({ min: 3 }),
        body("description", "description Must be At Least 5 Characters").isLength({
            min: 4,
        }),
    ],
    async (req, res) => {
        const { title, description, tag } = req.body;
        try {
            // Check for validation errors, return bad request and the errors if any
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const note = new Note({
                title,
                description,
                tag,
                user: req.user.id,
            });

            const savedNote = await note.save();
            res.json(savedNote);
        } catch (error) {
            // Log the error and respond with a server error message
            console.error(error.message);
            res.status(500).send("Server Error");
        }
    }
);

///ROUTE:3 = Updating an Existing Note Using : PUT: '/api/notes/updatenote/:id' **LOGIN REQUIRED**
router.put("/updatenote/:id", fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;
    try {
        // create a new note object
        const newNote = {};
        if (title) {
            newNote.title = title;
        }
        if (description) {
            newNote.description = description;
        }
        if (tag) {
            newNote.tag = tag;
        }

        // find the note to be updated
        let note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not found");
        }
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Unauthorized Access");
        }

        // update the note
        note = await Note.findByIdAndUpdate(
            req.params.id,
            { $set: newNote },
            { new: true }
        );
        res.json({ note });
    } catch (error) {
        // Log the error and respond with a server error message
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});

//ROUTE:4 = Deleting an Existing Note Using : DELETE: '/api/notes/deletenote/:id' **LOGIN REQUIRED**
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
    try {
        // find the note to be deleted
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not found");
        }

        // Check if the user has the right to delete the note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Unauthorized Access");
        }

        // Delete the note
        await note.deleteOne(); // or note.remove()
        res.json({ message: "Note deleted successfully" });
    } catch (error) {
        // Log the error and respond with a server error message
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
