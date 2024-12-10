export function getElementById(id) {
    const e = document.getElementById(id);
    if (e === null) {
        throw new Error(`Element with id ${id} not found`);
    }
    return e;
}
export const titleInput = getElementById("title-input");
export const bodyInput = getElementById("text-input");
export const saveButton = getElementById("save-button");
export const newButton = getElementById("new-button");
export const notesInfo = getElementById("edge-notification");
export const savedNotes = getElementById("notes");
