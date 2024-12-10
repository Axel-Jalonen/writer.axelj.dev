"use strict";
function getElementById(id) {
    const e = document.getElementById(id);
    if (e === null) {
        throw new Error(`Element with id ${id} not found`);
    }
    return e;
}
const titleInput = getElementById("title-input");
const textInput = getElementById("text-input");
const saveButton = getElementById("save-button");
const newButton = getElementById("new-button");
const savedNotes = getElementById("notes");
class Note {
    title;
    text;
    timestamp;
    uuid;
    constructor(title, text, timestamp, uuid) {
        this.title = title;
        this.text = text;
        this.timestamp = timestamp;
        this.uuid = uuid;
    }
}
let notes = [];
let currentContext;
function initalizer() {
    updateContext(new Note("", "", Date.now(), crypto.randomUUID()));
    const rawSavedNotes = localStorage.getItem("notes");
    if (rawSavedNotes !== null) {
        notes = JSON.parse(rawSavedNotes);
    }
}
initalizer();
function renderNotes() {
    savedNotes.innerHTML = "";
    notes.forEach((note) => {
        const noteElement = document.createElement("div");
        noteElement.classList.add("note-element");
        const dateString = new Date(note.timestamp).toLocaleDateString();
        noteElement.innerHTML = `
      <h3>${note.title.length > 20 ? note.title.slice(0, 20) + "..." : note.title}</h3>
      <p class="saved-note-body">${note.text.length > 25 ? note.text.slice(0, 25) + "..." : note.text}</p>
      <p>${dateString}</p>
      <button class="delete-button">Delete</button>
    `;
        noteElement.addEventListener("click", () => {
            if (currentContext.title !== "") {
                saveContext();
            }
            updateContext(note);
        });
        noteElement
            .querySelector(".delete-button")
            .addEventListener("click", (event) => {
            // Stop the event from bubbling to the note element
            // (parent of button), which would set the context
            // again
            event.stopPropagation();
            // Remove element from notes array
            notes.splice(notes.indexOf(note), 1);
            // Update storage
            updateStorage();
            // Create a new note & set as context
            updateContext(new Note("", "", Date.now(), crypto.randomUUID()));
            // Remove self from DOM
            noteElement.remove();
        });
        getElementById("notes").appendChild(noteElement);
    });
}
function updateContext(note) {
    currentContext = note;
    displayContext();
}
function saveContext() {
    dbg("Context saved initiated");
    const titleValue = titleInput.value;
    const textValue = textInput.value;
    currentContext.title = titleValue;
    currentContext.text = textValue;
    if (currentContext.title.trim() === "") {
        dbg("No title");
        return;
    }
    const note = notes.filter((n) => n.uuid === currentContext.uuid);
    // Update the note if it exists
    if (note.length === 1) {
        dbg("Found note");
        note[0].title = titleValue;
        note[0].text = textValue;
        dbg("Updated note");
    }
    else {
        dbg("No note found, updating context");
        // Update & add the current note context, if it isn't already saved
        currentContext.title = titleInput.value;
        currentContext.text = textInput.value;
        notes.push(currentContext);
        dbg("Updated context & added note, rerendered");
    }
    // Render the notes list with new data
    renderNotes();
    updateStorage();
}
function updateStorage() {
    localStorage.clear();
    localStorage.setItem("notes", JSON.stringify(notes));
}
function displayContext() {
    titleInput.value = currentContext.title;
    textInput.value = currentContext.text;
}
saveButton.addEventListener("click", saveContext);
newButton.addEventListener("click", () => {
    saveContext();
    updateContext(new Note("", "", Date.now(), crypto.randomUUID()));
});
// Load notes on page load
renderNotes();
function dbg(text) {
    console.log(text);
}
