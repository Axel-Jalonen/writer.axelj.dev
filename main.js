const titleInput = document.getElementById("title-input");
const textInput = document.getElementById("text-input");
const saveButton = document.getElementById("save-button");

saveButton.addEventListener("click", () => {
  const title = titleInput.value;
  const text = textInput.value;
  const timestamp = Date.now();

  if (!title || !text) {
    return;
  }

  const notes = JSON.parse(localStorage.getItem("notes") || "[]");
  notes.push({
    title,
    text,
    timestamp,
  });

  localStorage.setItem("notes", JSON.stringify(notes));

  titleInput.value = "";
  textInput.value = "";
});

const savedNotesContainer = document.getElementById("saved-notes");
const searchInput = document.getElementById("search-input");

function loadSavedNotes() {
  const notes = JSON.parse(localStorage.getItem("notes") || "[]");

  while (savedNotesContainer.children.length > 1) {
    savedNotesContainer.removeChild(savedNotesContainer.lastChild);
  }

  if (notes.length == 0) {
    const noNotesMessage = document.createElement("p");
    noNotesMessage.id = "no-notes-message";
    noNotesMessage.textContent = "No saved notes...";
    savedNotesContainer.appendChild(noNotesMessage);
    return;
  }

  notes.forEach((note, index) => {
    drawNote(note, index, notes, "transparent");
  });
}

// Load notes when page loads
loadSavedNotes();

// Update saved notes display whenever a new note is saved
saveButton.addEventListener("click", loadSavedNotes);

// Add search functionality
searchInput.addEventListener("input", () => {
  const searchTerm = searchInput.value.toLowerCase();

  // If search is empty, show all notes and return
  if (!searchTerm) {
    loadSavedNotes();
    return;
  }

  const notes = JSON.parse(localStorage.getItem("notes") || "[]");

  // Score and filter notes
  const scoredNotes = notes
    .map((note) => ({
      ...note,
      score: calculateSearchScore(note, searchTerm),
    }))
    .filter((note) => note.score > 0)
    .sort((a, b) => b.score - a.score);

  // Clear existing notes display
  while (savedNotesContainer.children.length > 1) {
    savedNotesContainer.removeChild(savedNotesContainer.lastChild);
  }

  if (scoredNotes.length == 0) {
    const noNotesMessage = document.createElement("p");
    noNotesMessage.id = "no-notes-message";
    noNotesMessage.textContent = "No notes found...";
    savedNotesContainer.appendChild(noNotesMessage);
    return;
  }

  // Display filtered notes
  scoredNotes.forEach((note, index) => {
    drawNote(note, index, notes, "red");
  });
});

// Add this helper function above the search event listener
function calculateSearchScore(note, searchTerm) {
  if (!searchTerm) return 0;

  const titleScore = note.title.toLowerCase().includes(searchTerm) ? 2 : 0;
  const textScore = note.text.toLowerCase().includes(searchTerm) ? 1 : 0;

  return titleScore + textScore;
}

function drawNote(note, index, notes, borderColor) {
  const noteElement = document.createElement("div");
  noteElement.style.border = `2px solid ${borderColor}`;
  noteElement.classList.add("note-element");
  const contentDiv = document.createElement("div");

  const noteDate = document.createElement("p");
  noteDate.classList.add("note-date");
  noteDate.textContent = new Date(note.timestamp).toLocaleString();

  const noteTitle = document.createElement("h3");
  noteTitle.textContent =
    note.title.length > 20 ? note.title.substring(0, 20) + "..." : note.title;

  const buttonsDiv = document.createElement("div");

  const editButton = document.createElement("button");
  editButton.innerText = "Edit";
  editButton.title = "Edit";
  editButton.addEventListener("click", () => {
    titleInput.value = note.title;
    textInput.value = note.text;
    notes.splice(index, 1);
    localStorage.setItem("notes", JSON.stringify(notes));

    // Remove the note from the display
    savedNotesContainer.removeChild(noteElement);

    loadSavedNotes();
  });

  const deleteButton = document.createElement("button");
  deleteButton.innerText = "Delete";
  deleteButton.title = "Delete";
  deleteButton.addEventListener("click", () => {
    notes.splice(index, 1);
    localStorage.setItem("notes", JSON.stringify(notes));

    // Remove the note from the display
    savedNotesContainer.removeChild(noteElement);

    loadSavedNotes();
  });

  contentDiv.appendChild(noteTitle);
  contentDiv.appendChild(noteDate);
  noteElement.appendChild(contentDiv);
  buttonsDiv.appendChild(editButton);
  buttonsDiv.appendChild(deleteButton);
  noteElement.appendChild(buttonsDiv);

  savedNotesContainer.appendChild(noteElement);
}
