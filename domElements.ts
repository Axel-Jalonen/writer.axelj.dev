export function getElementById(id: string): HTMLElement {
  const e = document.getElementById(id);
  if (e === null) {
    throw new Error(`Element with id ${id} not found`);
  }
  return e;
}

export const titleInput = getElementById("title-input") as HTMLInputElement;
export const bodyInput = getElementById("text-input") as HTMLInputElement;
export const saveButton = getElementById("save-button") as HTMLButtonElement;
export const newButton = getElementById("new-button") as HTMLButtonElement;
export const notesInfo = getElementById("edge-notification");
export const savedNotes = getElementById("notes");
