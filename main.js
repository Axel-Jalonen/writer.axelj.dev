function getElementById(id) {
    var e = document.getElementById(id);
    if (e === null) {
        throw new Error("Element with id ".concat(id, " not found"));
    }
    return e;
}
var titleInput = getElementById("title-input");
var textInput = getElementById("text-input");
var saveButton = getElementById("save-button");
var newButton = getElementById("new-button");
var savedNotes = getElementById("notes");
var Note = /** @class */ (function () {
    function Note(title, text, timestamp, uuid) {
        this.title = title;
        this.text = text;
        this.timestamp = timestamp;
        this.uuid = uuid;
    }
    return Note;
}());
var notes = [];
var currentContext;
function initalizer() {
    updateContext(new Note("", "", Date.now(), crypto.randomUUID()));
    var rawSavedNotes = localStorage.getItem("notes");
    if (rawSavedNotes !== null) {
        notes = JSON.parse(rawSavedNotes);
    }
}
initalizer();
function renderNotes() {
    savedNotes.innerHTML = "";
    notes.forEach(function (note) {
        var noteElement = document.createElement("div");
        noteElement.classList.add("note-element");
        var dateString = new Date(note.timestamp).toLocaleDateString();
        noteElement.innerHTML = "\n      <h3>".concat(note.title.length > 20 ? note.title.slice(0, 20) + "..." : note.title, "</h3>\n      <p class=\"saved-note-body\">").concat(note.text.length > 25 ? note.text.slice(0, 25) + "..." : note.text, "</p>\n      <p>").concat(dateString, "</p>\n      <button class=\"delete-button\">Delete</button>\n    ");
        noteElement.addEventListener("click", function () {
            if (currentContext.title !== "") {
                saveContext();
            }
            updateContext(note);
        });
        noteElement
            .querySelector(".delete-button")
            .addEventListener("click", function (event) {
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
    var titleValue = titleInput.value;
    var textValue = textInput.value;
    currentContext.title = titleValue;
    currentContext.text = textValue;
    if (currentContext.title.trim() === "") {
        dbg("No title");
        return;
    }
    var note = notes.filter(function (n) { return n.uuid === currentContext.uuid; });
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
newButton.addEventListener("click", function () {
    saveContext();
    updateContext(new Note("", "", Date.now(), crypto.randomUUID()));
});
textInput.addEventListener("keydown", function (event) {
    if (event.key === "Tab") {
        event.preventDefault();
        var start = textInput.selectionStart;
        var end = textInput.selectionEnd;
        if (start === null || end === null) {
            return;
        }
        // Set the new value with the tab inserted
        textInput.value =
            textInput.value.substring(0, start) +
                "    " +
                textInput.value.substring(end);
        // Move the cursor to the correct position after the tab
        textInput.selectionStart = textInput.selectionEnd = start + 4;
    }
});
// Load notes on page load
renderNotes();
function dbg(text) {
    console.log(text);
}
