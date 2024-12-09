function getElementById(id: string): HTMLElement {
  const e = document.getElementById(id);
  if (e === null) {
    throw new Error(`Element with id ${id} not found`);
  }
  return e;
}

const titleInput = getElementById("title-input") as HTMLInputElement;
const textInput = getElementById("text-input") as HTMLInputElement;
const saveButton = getElementById("save-button") as HTMLButtonElement;
const newButton = getElementById("new-button") as HTMLButtonElement;
const savedNotes = getElementById("notes");

// When the user opens the page we render saved notes.
// Each saved note has an event listener for click
// When we click it, it will fill the editor context
// with the note content and NOT remove the note from the
// saved notes list. It will automatically saved the note
// Every 2 seconds, so we don't have to worry about losing
// the note content. We can always click the delete button
// to remove a note, whether or not it's currently in context.
// So each note will have a UUID, and we can use that to
// identify the note in the saved notes list and remove it

class Note {
  title: string;
  text: string;
  timestamp: number;
  uuid: string;

  constructor(title: string, text: string, timestamp: number, uuid: string) {
    this.title = title;
    this.text = text;
    this.timestamp = timestamp;
    this.uuid = uuid;
  }
}

let notes: Note[] = [];
let currentContext: Note;

function initalizer() {
  currentContext = new Note("", "", Date.now(), crypto.randomUUID());
  const rawSavedNotes = localStorage.getItem("notes");
  if (rawSavedNotes !== null) {
    notes = JSON.parse(rawSavedNotes);
  }
}
initalizer();

function renderNotes() {
  savedNotes.innerHTML = "";
  notes.forEach((note: Note) => {
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
      currentContext = note;
      displayContext();
    });

    noteElement
      .querySelector(".delete-button")!
      .addEventListener("click", () => {
        notes.splice(notes.indexOf(note), 1);
        localStorage.clear();
        localStorage.setItem("notes", JSON.stringify(notes));
        noteElement.remove();
      });
    getElementById("notes").appendChild(noteElement);
  });
}

function saveContext() {
  dbg("Context saved initiated");
  currentContext.title = titleInput.value;
  currentContext.text = textInput.value;
  if (currentContext.title.trim() === "") {
    dbg("No title");
    return;
  }
  const note = notes.filter((n) => n.uuid === currentContext.uuid);
  // Update the note if it exists
  if (note.length === 1) {
    dbg("Found note");
    note[0].title = titleInput.value;
    note[0].text = textInput.value;
    dbg("Updated note");
  } else {
    dbg("No note found, updating context");
    // Update & add the current note context, if it isn't already saved
    currentContext.title = titleInput.value;
    currentContext.text = textInput.value;
    notes.push(currentContext);
    renderNotes();
    updateStorage();
    dbg("Updated context & added note, rerendered");
  }
  // Render the notes list with new data
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
  currentContext = new Note("", "", Date.now(), crypto.randomUUID());
  displayContext();
});

// Load notes on page load
renderNotes();

function dbg(text: String) {
  console.log(text);
}
