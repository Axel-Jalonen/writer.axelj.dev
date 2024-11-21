const titleInput = document.getElementById('title-input');
const textInput = document.getElementById('text-input');
const saveButton = document.getElementById('save-button');

const clearButton = document.getElementById('clear-button');

clearButton.addEventListener('click', () => {
    titleInput.value = '';
    textInput.value = '';
});


saveButton.addEventListener('click', () => {
    const title = titleInput.value;
    const text = textInput.value;
    
    if (!title || !text) {
        return;
    }

    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    notes.push({
        title,
        text,
        timestamp: Date.now()
    });
    
    localStorage.setItem('notes', JSON.stringify(notes));
    
    titleInput.value = '';
    textInput.value = '';
});

const savedNotesContainer = document.getElementById('saved-notes');
const searchInput = document.getElementById('search-input');

function loadSavedNotes() {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    
    // Clear existing notes display
    while (savedNotesContainer.children.length > 2) { // Keep the h1 title and search input
        savedNotesContainer.removeChild(savedNotesContainer.lastChild);
    }

    notes.forEach((note, index) => {
        const noteElement = document.createElement('div');
        noteElement.style.padding = '1rem';
        noteElement.style.marginTop = '1rem';
        noteElement.style.backgroundColor = '#f5f5f5';
        noteElement.style.borderRadius = '0.5rem';
        
        const noteTitle = document.createElement('h3');
        noteTitle.textContent = note.title.length > 20 ? 
            note.title.substring(0, 20) + '...' : 
            note.title;
        
        const noteText = document.createElement('p');
        noteText.textContent = note.text.length > 75 ? 
            note.text.substring(0, 20) + '...' : 
            note.text;
        
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => {
            titleInput.value = note.title;
            textInput.value = note.text;
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            notes.splice(index, 1);
            localStorage.setItem('notes', JSON.stringify(notes));
            loadSavedNotes();
        });
        
        noteElement.appendChild(noteTitle);
        noteElement.appendChild(noteText);
        noteElement.appendChild(editButton);
        noteElement.appendChild(deleteButton);
        
        savedNotesContainer.appendChild(noteElement);
    });
}

// Load notes when page loads
loadSavedNotes();

// Update saved notes display whenever a new note is saved
saveButton.addEventListener('click', loadSavedNotes);

// Add search functionality
searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    const filteredNotes = notes.filter(note => 
        note.title.toLowerCase().includes(searchTerm) || 
        note.text.toLowerCase().includes(searchTerm)
    );
    
    // Clear existing notes display
    while (savedNotesContainer.children.length > 2) { // Keep the h1 title and search input
        savedNotesContainer.removeChild(savedNotesContainer.lastChild);
    }
    
    // Display filtered notes
    filteredNotes.forEach((note, index) => {
        const noteElement = document.createElement('div');
        noteElement.style.padding = '1rem';
        noteElement.style.marginTop = '1rem';
        noteElement.style.backgroundColor = '#f5f5f5';
        noteElement.style.borderRadius = '0.5rem';
        
        const noteTitle = document.createElement('h3');
        noteTitle.textContent = note.title.length > 20 ? 
            note.title.substring(0, 20) + '...' : 
            note.title;
        
        const noteText = document.createElement('p');
        noteText.textContent = note.text.length > 75 ? 
            note.text.substring(0, 20) + '...' : 
            note.text;
        
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => {
            titleInput.value = note.title;
            textInput.value = note.text;
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            notes.splice(index, 1);
            localStorage.setItem('notes', JSON.stringify(notes));
            loadSavedNotes();
        });
        
        noteElement.appendChild(noteTitle);
        noteElement.appendChild(noteText);
        noteElement.appendChild(editButton);
        noteElement.appendChild(deleteButton);
        
        savedNotesContainer.appendChild(noteElement);
    });
});

const zenModeButton = document.getElementById('zen-mode-button');
zenModeButton.addEventListener('click', () => {
    savedNotesContainer.style.display = savedNotesContainer.style.display === 'none' ? 'flex' : 'none';
    document.getElementById('editor-top').style.display = document.getElementById('editor-top').style.display === 'none' ? 'block' : 'none';
    textInput.style.borderColor = textInput.style.borderColor === 'rgb(0, 0, 0)' ? '#eee' : '#000';
    document.getElementById('editor').style.width = document.getElementById('editor').style.width === '100%' ? '75%' : '100%';
});