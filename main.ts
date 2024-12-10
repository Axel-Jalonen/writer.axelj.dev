function getElementById(id: string): HTMLElement {
  const e = document.getElementById(id);
  if (e === null) {
    throw new Error(`Element with id ${id} not found`);
  }
  return e;
}

const titleInput = getElementById("title-input") as HTMLInputElement;
const bodyInput = getElementById("text-input") as HTMLInputElement;
const saveButton = getElementById("save-button") as HTMLButtonElement;
const newButton = getElementById("new-button") as HTMLButtonElement;
const notesInfo = getElementById("edge-notification");
const savedNotes = getElementById("notes");

type Display = "block" | "none";

class Note {
  title: string;
  body: string;
  timestamp: number;
  uuid: string;

  constructor(title: string, text: string, timestamp: number, uuid: string) {
    this.title = title;
    this.body = text;
    this.timestamp = timestamp;
    this.uuid = uuid;
  }
}

let noteMemoryState: Note[] = [];
let editorContext: Note;

function initalizer() {
  renderContext(new Note("New Note", "", Date.now(), crypto.randomUUID()));
  const storageNotes = localStorage.getItem("notes");
  if (storageNotes !== null) {
    const parsedNotes = JSON.parse(storageNotes);
    // Handle old notes format
    parsedNotes.forEach((note: any) => {
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
  noteMemoryState.forEach((note: Note) => {
    const noteNode = document.createElement("div");
    noteNode.classList.add("note-element");
    const dateString = new Date(note.timestamp).toLocaleDateString();
    noteNode.innerHTML = `
      <h3>${note.title ? (note.title.length > 20 ? note.title.slice(0, 20) + "..." : note.title) : ""}</h3>
      <p class="saved-note-body">${note.body ? (note.body.length > 25 ? note.body.slice(0, 25) + "..." : note.body) : ""}</p>
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
      .querySelector(".delete-button")!
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
        renderContext(
          new Note("New Note", "", Date.now(), crypto.randomUUID()),
        );
        // Remove self from DOM
        noteNode.remove();
        if (noteMemoryState.length === 0) {
          showStatus("No saved notes", "block");
        }
      });
    getElementById("notes").appendChild(noteNode);
  });
}

function showStatus(text: string, display: Display) {
  notesInfo.style.display = display;
  notesInfo.innerText = text;
}

function renderContext(note: Note) {
  editorContext = note;
  titleInput.value = editorContext.title;
  bodyInput.value = editorContext.body;
}

function saveEditorContext() {
  dbg("Context saved initiated");
  const titleContent = titleInput.value;
  const bodyContent = bodyInput.value;
  editorContext.title = titleContent;
  editorContext.body = bodyContent;
  if (titleContent.trim() === "New Note" && bodyContent.trim() === "") {
    dbg("No title");
    return;
  }
  const foundNotes = noteMemoryState.filter(
    (n) => n.uuid === editorContext.uuid,
  );
  // Update the note if it exists
  if (foundNotes.length === 1) {
    dbg("Found note");
    const uniqueNote = foundNotes[0];
    uniqueNote.title = titleContent;
    uniqueNote.body = bodyContent;
    dbg("Updated note");
  } else {
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

saveButton.addEventListener("click", saveEditorContext);

newButton.addEventListener("click", () => {
  saveEditorContext();
  renderContext(new Note("New Note", "", Date.now(), crypto.randomUUID()));
});

bodyInput.addEventListener("keydown", (event) => {
  if (event.key === "Tab") {
    event.preventDefault();
    const start = bodyInput.selectionStart;
    const end = bodyInput.selectionEnd;
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
document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "s") {
    event.preventDefault();
    saveEditorContext();
  }
});

// Load notes on page load
renderSavedNotes();

function dbg(text: String) {
  console.log(text);
}
