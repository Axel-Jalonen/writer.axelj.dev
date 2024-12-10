import * as domElements from "./domElements";
class Note {
    title;
    body;
    timestamp;
    uuid;
    constructor(title, text, timestamp, uuid) {
        this.title = title;
        this.body = text;
        this.timestamp = timestamp;
        this.uuid = uuid;
    }
}
let noteMemoryState = [];
let editorContext;
function initalizer() {
    renderContext(new Note("New Note", "", Date.now(), crypto.randomUUID()));
    const storageNotes = localStorage.getItem("notes");
    if (storageNotes !== null) {
        noteMemoryState = JSON.parse(storageNotes);
    }
}
initalizer();
function renderSavedNotes() {
    domElements.savedNotes.innerHTML = "";
    if (noteMemoryState.length === 0) {
        showStatus("No saved notes", "block");
        return;
    }
    showStatus("", "none");
    domElements.notesInfo.style.display = "none";
    noteMemoryState.forEach((note) => {
        const noteNode = document.createElement("div");
        noteNode.classList.add("note-element");
        const dateString = new Date(note.timestamp).toLocaleDateString();
        noteNode.innerHTML = `
      <h3>${note.title.length > 20 ? note.title.slice(0, 20) + "..." : note.title}</h3>
      <p class="saved-note-body">${note.body.length > 25 ? note.body.slice(0, 25) + "..." : note.body}</p>
      <p>${dateString}</p>
      <button class="delete-button">Delete</button>
    `;
        noteNode.addEventListener("click", () => {
            if (editorContext.title !== "") {
                saveEditorContext();
            }
            renderContext(note);
        });
        noteNode
            .querySelector(".delete-button")
            .addEventListener("click", (event) => {
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
        domElements.getElementById("notes").appendChild(noteNode);
    });
}
function showStatus(text, display) {
    domElements.notesInfo.style.display = display;
    domElements.notesInfo.innerText = text;
}
function renderContext(note) {
    editorContext = note;
    domElements.titleInput.value = editorContext.title;
    domElements.bodyInput.value = editorContext.body;
}
function saveEditorContext() {
    dbg("Context saved initiated");
    const titleContent = domElements.titleInput.value;
    const bodyContent = domElements.bodyInput.value;
    editorContext.title = titleContent;
    editorContext.body = bodyContent;
    if (bodyContent.trim() === "") {
        dbg("No title");
        return;
    }
    const foundNotes = noteMemoryState.filter((n) => n.uuid === editorContext.uuid);
    // Update the note if it exists
    if (foundNotes.length === 1) {
        dbg("Found note");
        const uniqueNote = foundNotes[0];
        uniqueNote.title = titleContent;
        uniqueNote.body = bodyContent;
        dbg("Updated note");
    }
    else {
        dbg("No note found, updating context");
        // Update & add the current note context, if it isn't already saved
        editorContext.title = domElements.titleInput.value;
        editorContext.body = domElements.bodyInput.value;
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
domElements.saveButton.addEventListener("click", saveEditorContext);
domElements.newButton.addEventListener("click", () => {
    saveEditorContext();
    renderContext(new Note("New Note", "", Date.now(), crypto.randomUUID()));
});
domElements.bodyInput.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
        event.preventDefault();
        const start = domElements.bodyInput.selectionStart;
        const end = domElements.bodyInput.selectionEnd;
        if (start === null || end === null) {
            return;
        }
        // Set the new value with the tab inserted
        domElements.bodyInput.value =
            domElements.bodyInput.value.substring(0, start) +
                "\t" +
                domElements.bodyInput.value.substring(end);
        // Move the cursor to the correct position after the tab
        domElements.bodyInput.selectionStart = domElements.bodyInput.selectionEnd =
            start + 1;
    }
});
// Load notes on page load
renderSavedNotes();
function dbg(text) {
    console.log(text);
}
