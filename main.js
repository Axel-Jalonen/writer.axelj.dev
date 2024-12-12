function getElementById(id) {
    var e = document.getElementById(id);
    if (e === null) {
        throw new Error("Element with id ".concat(id, " not found"));
    }
    return e;
}
var titleInput = getElementById("title-input");
var bodyInput = getElementById("text-input");
// const saveButton = getElementById("save-button") as HTMLButtonElement;
var newButton = getElementById("new-button");
var notesInfo = getElementById("edge-notification");
var savedNotes = getElementById("notes");
var savedNotesContainer = getElementById("saved-notes");
var showNotesButton = getElementById("show-notes");
var Note = /** @class */ (function () {
    function Note(title, text, timestamp, uuid) {
        this.title = title;
        this.body = text;
        this.timestamp = timestamp;
        this.uuid = uuid;
    }
    return Note;
}());
var noteMemoryState = [];
var editorContext;
function initalizer() {
    renderContext(new Note("New Note", "", Date.now(), crypto.randomUUID()));
    var storageNotes = localStorage.getItem("notes");
    if (storageNotes !== null) {
        var parsedNotes = JSON.parse(storageNotes);
        // Handle old notes format
        parsedNotes.forEach(function (note) {
            if (note.text) {
                note.body = note.text;
                delete note.text;
            }
        });
        noteMemoryState = parsedNotes;
    }
}
initalizer();
function renderSavedNotes() {
    savedNotes.innerHTML = "";
    if (noteMemoryState.length === 0) {
        showStatus("No saved notes", "block");
        return;
    }
    showStatus("", "none");
    notesInfo.style.display = "none";
    noteMemoryState.forEach(function (note) {
        var noteNode = document.createElement("div");
        noteNode.classList.add("note-element");
        var dateString = new Date(note.timestamp).toLocaleDateString();
        noteNode.innerHTML = "\n      <h3>".concat(note.title ? (note.title.length > 20 ? note.title.slice(0, 20) + "..." : note.title) : "", "</h3>\n      <p class=\"saved-note-body\">").concat(note.body ? (note.body.length > 25 ? note.body.slice(0, 25) + "..." : note.body) : "", "</p>\n      <p>").concat(dateString, "</p>\n      <button class=\"delete-button\">Delete</button>\n    ");
        noteNode.addEventListener("click", function () {
            if (editorContext.title !== "") {
                saveEditorContext();
            }
            renderContext(note);
        });
        noteNode
            .querySelector(".delete-button")
            .addEventListener("click", function (event) {
            // Stop the event from bubbling to the note element
            // (parent of button), which would set the context
            // again
            event.stopPropagation();
            // Remove element from notes array
            noteMemoryState.splice(noteMemoryState.indexOf(note), 1);
            // Update storage
            resetStorageWithNotes();
            // Create a new note & set as context
            renderContext(new Note("New Note", "", Date.now(), crypto.randomUUID()));
            // Remove self from DOM
            noteNode.remove();
            if (noteMemoryState.length === 0) {
                showStatus("No saved notes", "block");
            }
        });
        getElementById("notes").appendChild(noteNode);
    });
}
function showStatus(text, display) {
    notesInfo.style.display = display;
    notesInfo.innerText = text;
}
function renderContext(note) {
    editorContext = note;
    titleInput.value = editorContext.title;
    bodyInput.value = editorContext.body;
}
function saveEditorContext() {
    dbg("Context saved initiated");
    var titleContent = titleInput.value;
    var bodyContent = bodyInput.value;
    editorContext.title = titleContent;
    editorContext.body = bodyContent;
    if (titleContent.trim() === "New Note" && bodyContent.trim() === "") {
        dbg("No title");
        return;
    }
    var foundNotes = noteMemoryState.filter(function (n) { return n.uuid === editorContext.uuid; });
    // Update the note if it exists
    if (foundNotes.length === 1) {
        dbg("Found note");
        var uniqueNote = foundNotes[0];
        uniqueNote.title = titleContent;
        uniqueNote.body = bodyContent;
        dbg("Updated note");
    }
    else {
        dbg("No note found, updating context");
        // Update & add the current note context, if it isn't already saved
        editorContext.title = titleInput.value;
        editorContext.body = bodyInput.value;
        noteMemoryState.push(editorContext);
        dbg("Updated context & added note, rerendered");
    }
    // Render the notes list with new data
    renderSavedNotes();
    resetStorageWithNotes();
}
function resetStorageWithNotes() {
    localStorage.clear();
    localStorage.setItem("notes", JSON.stringify(noteMemoryState));
}
// saveButton.addEventListener("click", saveEditorContext);
newButton.addEventListener("click", function () {
    saveEditorContext();
    renderContext(new Note("New Note", "", Date.now(), crypto.randomUUID()));
});
titleInput.addEventListener("input", function () {
    saveEditorContext();
    renderSavedNotes();
});
bodyInput.addEventListener("input", function () {
    saveEditorContext();
    renderSavedNotes();
});
bodyInput.addEventListener("keydown", function (event) {
    if (event.key === "Tab") {
        event.preventDefault();
        var start = bodyInput.selectionStart;
        var end = bodyInput.selectionEnd;
        if (start === null || end === null) {
            return;
        }
        // Set the new value with the tab inserted
        bodyInput.value =
            bodyInput.value.substring(0, start) +
                "\t" +
                bodyInput.value.substring(end);
        // Move the cursor to the correct position after the tab
        bodyInput.selectionStart = bodyInput.selectionEnd = start + 1;
    }
});
// Saving with ctrl/cmd + s
document.addEventListener("keydown", function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        saveEditorContext();
    }
});
savedNotes.addEventListener("click", function () {
    var display = savedNotesContainer.style.display === "block" ? "none" : "block";
    savedNotesContainer.style.display = display;
});
// Load notes on page load
renderSavedNotes();
showNotesButton.addEventListener("click", function () {
    var display = savedNotesContainer.style.display === "block" ? "none" : "block";
    savedNotesContainer.style.display = display;
});
function dbg(text) {
    console.log(text);
}
