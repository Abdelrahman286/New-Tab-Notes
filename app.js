async function getConfig() {
  const CONFIG = await chrome.storage.sync.get(null);
  return CONFIG;
}

const notesContainer = document.querySelector(".notes-wrapper");
let shortcutEnabled = "on";

async function intialStyleConfig() {
  const CONFIG = await getConfig();

  // handle shortcut
  if (CONFIG.shortcutEnabled) {
    isShortCutEnabled.checked = CONFIG.shortcutEnabled == "on" ? true : false;
    isShortCutEnabled.value = CONFIG.shortcutEnabled;
    shortcutEnabled = CONFIG.shortcutEnabled;
  } else {
    shortcutEnabled = "on";
    isShortCutEnabled.checked = true;
  }

  // handle bg color
  if (CONFIG.bgColor !== undefined) {
    // change bg color here
    if (CONFIG.bgColor == "darkGrid") {
      notesContainer.className = "notes-wrapper darkGrid";

      colorFrom.children[0].click();
    } else if (CONFIG.bgColor == "lightGrid") {
      notesContainer.className = "notes-wrapper lightGrid";
      colorFrom.children[3].click();
    } else {
      // colorFrom.children[6].click(); // this make will override the bg in storage
      notesContainer.className = "notes-wrapper";
      notesContainer.style.background = CONFIG.bgColor;
    }
  }

  notesContainer.style.color =
    CONFIG.fontColor == undefined ? "inherit" : CONFIG.fontColor;

  notesContainer.style.fontSize =
    CONFIG.fontSize == undefined ? "inherit" : CONFIG.fontSize + "px";

  // update the input feild
  document.querySelector(".font-size-in").value =
    CONFIG.fontSize == undefined ? "18" : CONFIG.fontSize;
}

intialStyleConfig();

// delete all notes
const deleteAllBtn = document.querySelector(".delete-all");
async function deleteAllNotes() {
  await chrome.storage.local.clear();
  fetchAllNotes();
}
deleteAllBtn.addEventListener("click", deleteAllNotes);

// fetch all notes

const fetchAllNotes = async () => {
  notesContainer.innerHTML = "";
  const notes = await chrome.storage.local.get(null);

  // console.log(notesList);
  Object.entries(notes)
    .sort((a, b) => {
      return a[1].date - b[1].date;
    })
    .forEach((ele) => {
      if (ele[1].archived == "0") {
        renderNotes(
          ele[0],
          ele[1].text,
          ele[1].top,
          ele[1].left,
          ele[1].width,
          ele[1].height,
          ele[1].bg,
          ele[1].hc,
          ele[1].archived,
          ele[1].date
        );
      }
    });
};

const colors = [
  ["F3ECC3", "F8DD4E"],
  ["DE86E6", "EB0BFF"],
  ["7FF3AE", "00FF66"],
  ["76BBEC", "2872CD"],
  ["FF886E", "FF2E00"],
  ["00B9E1", "0085A3"],
];

function renderNotes(
  uuid,
  text,
  top,
  left,
  width,
  height,
  bg,
  hc,
  archived,
  date
) {
  // note parent
  const note = document.createElement("div");

  note.dataset.uuid = uuid;
  note.dataset.date = date;
  note.dataset.width = width;
  note.dataset.height = height;
  note.dataset.bg = bg;
  note.dataset.hc = hc;
  note.dataset.archived = archived;
  note.classList.add("note");

  //------------------ actions div
  const actionsDiv = document.createElement("div");
  actionsDiv.classList.add("actions");
  actionsDiv.style.background = hc;

  //actiosn buttons
  const actionsBtns = document.createElement("div");
  actionsBtns.classList.add("actions-btns");

  //delete button
  const deleteBtn = document.createElement("div");
  // deleteBtn.textContent = "🗑️";

  deleteBtn.className = "icon icon-bin";
  deleteBtn.addEventListener("click", deleteNote);

  //change color button
  const viewColorBtn = document.createElement("div");
  // viewColorBtn.textContent = "🎨";
  viewColorBtn.classList.add("icon-paint-format");
  viewColorBtn.classList.add("icon");
  viewColorBtn.addEventListener("click", toggleColorList);

  //archive button
  const archiveBtn = document.createElement("div");
  // archiveBtn.textContent = "🗁";
  archiveBtn.className = "icon icon-folder-download";

  archiveBtn.classList.add("archive-toolip");
  archiveBtn.addEventListener("click", handleArchive);

  // unarchive button
  const unarchieveBtn = document.createElement("div");
  // unarchieveBtn.textContent = "↩️";
  unarchieveBtn.className = "icon icon-folder-upload";
  unarchieveBtn.classList.add("unarchive-toolip");
  unarchieveBtn.addEventListener("click", handleUnarchive);

  if (archived == "0") {
    actionsBtns.appendChild(archiveBtn);
  } else {
    // add unarchieve button
    actionsBtns.appendChild(unarchieveBtn);
  }

  actionsBtns.appendChild(viewColorBtn);
  actionsBtns.appendChild(deleteBtn);

  // to make stop dragging when we drag over another element
  // // it's not so good, since it disable the drag if i dragged too fast with the mouse , could be i used the global draggedELement
  // actionsDiv.addEventListener("mouseleave", () => {
  //   isMouseDown = false;
  // });

  actionsDiv.appendChild(actionsBtns);
  note.appendChild(actionsDiv);
  const noteTextFill = document.createElement("textarea");
  noteTextFill.spellcheck = false;
  // noteTextFill.autofocus = true;
  noteTextFill.value = text;
  noteTextFill.style.background = bg;
  noteTextFill.style.width = width;
  noteTextFill.style.height = height;
  // listen to resize
  noteTextFill.addEventListener("mouseup", (e) => {
    updateTextAreaSize(e.target, e.target.style.width, e.target.style.height);
  });
  // listen to text change
  noteTextFill.addEventListener("input", (e) => {
    updateTextAreaContent(e.target.parentNode, e.target.value);
  });
  // top and left
  note.style.top = top;
  note.style.left = left;
  note.dataset.top = top;
  note.dataset.left = left;
  note.appendChild(noteTextFill);
  notesContainer.appendChild(note);
}

async function handleUnarchive(e) {
  const ele = e.target.parentNode.parentNode.parentNode;
  const text = ele.children[1].value;
  const uuid = ele.dataset.uuid;
  await chrome.storage.local.set({
    [uuid]: {
      text: text,
      bg: ele.dataset.bg,
      hc: ele.dataset.hc,
      width: ele.dataset.width,
      height: ele.dataset.height,
      top: ele.dataset.top,
      left: ele.dataset.left,
      archived: 0,
      date: ele.dataset.date,
    },
  });

  ele.remove();
}

async function handleArchive(e) {
  e.stopPropagation();

  const el = e.target.parentNode.parentNode.parentNode;
  const uuid = el.dataset.uuid;
  el.dataset.archived = "1";
  await chrome.storage.local.set({
    [uuid]: {
      text: el.children[1].value,
      bg: el.dataset.bg,
      hc: el.dataset.hc,
      width: el.dataset.width,
      height: el.dataset.height,
      top: el.dataset.top,
      left: el.dataset.left,
      archived: 1,
      date: el.dataset.date,
    },
  });

  el.remove();
}

async function toggleColorList(e) {
  const E = e.target.parentNode.parentNode.parentNode;
  const checkEle = document.querySelector(".colors-list");

  const createColorsList = () => {
    const colorsList = document.createElement("div");
    colorsList.classList.add("colors-list");

    colors.forEach((ele) => {
      const colorOption = document.createElement("button");
      // colorOption.textContent = "OO";
      colorOption.classList.add("color-option");
      colorOption.style.background = `#${ele[1]}`;
      // add event to change the color dataset
      colorOption.addEventListener("click", async () => {
        // useless
        E.dataset.hc = `#${ele[1]}`;
        E.dataset.bg = `#${ele[0]}`;
        // style
        E.children[0].style.background = `#${ele[1]}`;
        E.children[1].style.background = `#${ele[0]}`;
        // storage
        await chrome.storage.local.set({
          [E.dataset.uuid]: {
            text: E.children[1].value,
            bg: `#${ele[0]}`,
            hc: `#${ele[1]}`,
            width: E.dataset.width,
            height: E.dataset.height,
            top: E.dataset.top,
            left: E.dataset.left,
            archived: E.dataset.archived,
            date: E.dataset.date,
          },
        });

        // destroy the menu
        colorsList.remove();
      });

      colorsList.appendChild(colorOption);
    });
    // close colorList button
    const closeColorListBtn = document.createElement("button");
    closeColorListBtn.classList.add("close-color-list");
    closeColorListBtn.textContent = "X";
    closeColorListBtn.addEventListener("click", () => {
      colorsList.remove();
    });

    colorsList.appendChild(closeColorListBtn);

    E.appendChild(colorsList);
  };

  if (checkEle) {
    checkEle.remove();
    createColorsList();
  } else {
    createColorsList();
  }
}

async function updateTextAreaContent(el, text) {
  // el = note card
  const uuid = el.dataset.uuid;
  await chrome.storage.local.set({
    [uuid]: {
      text: text,
      bg: el.dataset.bg,
      hc: el.dataset.hc,
      width: el.dataset.width,
      height: el.dataset.height,
      top: el.dataset.top,
      left: el.dataset.left,
      archived: el.dataset.archived,
      date: el.dataset.date,
    },
  });
}
async function updateTextAreaSize(el, width, height) {
  // el = textarea
  // E = Note Card
  const uuid = el.parentNode.dataset.uuid;
  const N = el.parentNode;
  N.dataset.width = width;
  N.dataset.height = height;
  await chrome.storage.local.set({
    [uuid]: {
      text: el.value,
      bg: N.dataset.bg,
      hc: N.dataset.hc,
      top: N.dataset.top,
      left: N.dataset.left,
      archived: N.dataset.archived,
      width: width,
      height: height,
      date: N.dataset.date,
    },
  });
}

//--------- handle drag ------------------
let isMouseDown = false;
let lastX;
let lastY;
let dragTarget;
document.addEventListener("mouseleave", () => {
  isMouseDown = false;
});
document.addEventListener("mouseup", () => {
  isMouseDown = false;
});

document.addEventListener("mousedown", (e) => {
  if (!e.target.classList.contains("actions")) return;
  dragTarget = e.target.parentNode;

  lastX = e.offsetX - dragTarget.parentNode.scrollLeft;
  lastY = e.offsetY - dragTarget.parentNode.scrollTop;
  isMouseDown = true;
});
const drag = async (e) => {
  if (isMouseDown) {
    // for testing

    let T_value = e.clientY - lastY;
    let L_value = e.clientX - lastX;

    if (L_value <= 0) {
      L_value = 0;
    }

    if (T_value <= 0) {
      T_value = 0;
    }

    // we need to move the whole note container, not the actions bar
    dragTarget.style.left = `${L_value}px`;
    dragTarget.style.top = `${T_value}px`;

    dragTarget.dataset.top = `${T_value}px`;
    dragTarget.dataset.left = `${L_value}px`;

    const uuid = dragTarget.dataset.uuid;

    await chrome.storage.local.set({
      [uuid]: {
        text: dragTarget.children[1].value,
        bg: dragTarget.dataset.bg,
        hc: dragTarget.dataset.hc,
        top: `${T_value}px`,
        left: `${L_value}px`,
        width: dragTarget.dataset.width,
        height: dragTarget.dataset.height,
        archived: dragTarget.dataset.archived,
        date: dragTarget.dataset.date,
      },
    });
  }
};
document.addEventListener("mousemove", drag);

//------- adding new note
const addBtn = document.querySelector(".add-note");
function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}
const createNote = async () => {
  const uuid = crypto.randomUUID();
  const date = Date.now();

  await chrome.storage.local.set({
    [uuid]: {
      text: "",
      archived: 0,
      top: `${innerHeight / 2 - 100}px`,
      left: `${innerWidth / 2 - 100}px`,
      width: "300px",
      height: "300px",
      bg: "#F3ECC3",
      hc: "#F8DD4E",
      date: date,
    },
  });

  fetchAllNotes();
};
addBtn.addEventListener("click", createNote);

//----- delete single note-----------
const deleteNote = async (e) => {
  const ele = e.target.parentNode.parentNode.parentNode;
  const key = ele.dataset.uuid;
  ele.remove();
  await chrome.storage.local.remove([key]);
};

// viewing archived notes
const viewArchiveBtn = document.querySelector(".view-archive");
async function viewArchivedNotes() {
  document.title = "Archive";
  notesContainer.innerHTML = "";
  const notes = await chrome.storage.local.get(null);

  Object.entries(notes)
    .sort((a, b) => {
      return a[1].date - b[1].date;
    })
    .forEach((ele) => {
      if (ele[1].archived == "1") {
        renderNotes(
          ele[0],
          ele[1].text,
          ele[1].top,
          ele[1].left,
          ele[1].width,
          ele[1].height,
          ele[1].bg,
          ele[1].hc,
          ele[1].archived,
          ele[1].date
        );
      }
    });
}
viewArchiveBtn.addEventListener("click", viewArchivedNotes);

// view all notes
const viewAllNotesBtn = document.querySelector(".view-all-notes");
viewAllNotesBtn.addEventListener("click", () => {
  document.title = "My notes";
  fetchAllNotes();
});
//-------- intial render----------
fetchAllNotes();

// ➡️ collapse-sidemenu
let isSidemenuCollapsed = false;
document.querySelector(".collapse-sidemenu").addEventListener("click", (e) => {
  if (!isSidemenuCollapsed) {
    // e.target.textContent = "⬅️";
    e.target.className = "collapse-sidemenu icon-circle-left";
    isSidemenuCollapsed = true;
    viewArchiveBtn.style.display = "none";
    viewAllNotesBtn.style.display = "none";
    settingsBtn.style.display = "none";
  } else {
    e.target.className = "collapse-sidemenu icon-circle-right";
    isSidemenuCollapsed = false;
    settingsBtn.style.display = "inline";
    viewArchiveBtn.style.display = "inline";
    viewAllNotesBtn.style.display = "inline";
  }
});

//------------- settings window ----------------
const settingsBtn = document.querySelector(".settings-btn");
const settingsWindow = document.querySelector(".settings-window");
let isSettingWindow = false;
settingsBtn.addEventListener("click", () => {
  if (isSettingWindow) {
    isSettingWindow = false;
    settingsWindow.style.display = "none";
  } else {
    isSettingWindow = true;
    settingsWindow.style.display = "block";
  }
});
// close settings button from inside the window
const closeSettingsWindow = document.querySelector(".close-settings");
closeSettingsWindow.addEventListener("click", () => {
  settingsWindow.style.display = "none";
  isSettingWindow = false;
});
// notes settings : Alt + A
const isShortCutEnabled = document.querySelector(".isShortCutEnabled");

isShortCutEnabled.addEventListener("change", handleNotesSettings);
async function handleNotesSettings(e) {
  if (e.target.value == "on") {
    e.target.value = "off";
    shortcutEnabled = "off";
  } else {
    e.target.value = "on";
    shortcutEnabled = "on";
  }

  await chrome.storage.sync.set({ shortcutEnabled: e.target.value });
}
// background color (update the global CONFIG object)
const colorFrom = document.querySelector(".color-form");
let lastUsedBgOption;

async function handleBgConfig(e) {
  if (e.target.value == "darkGrid") {
    lastUsedBgOption = "darkGrid";
    notesContainer.className = `notes-wrapper darkGrid`;
    await chrome.storage.sync.set({ bgColor: "darkGrid" });
  } else if (e.target.value == "lightGrid") {
    lastUsedBgOption = "lightGrid";
    notesContainer.className = "notes-wrapper lightGrid";
    await chrome.storage.sync.set({ bgColor: "lightGrid" });
  } else if (e.target.value == "solid") {
    // here we add the solid color
    lastUsedBgOption = "solid";
    notesContainer.className = "notes-wrapper";
    const c = e.target.nextElementSibling.nextElementSibling.value;

    notesContainer.style.background = c;
    await chrome.storage.sync.set({ bgColor: c });
  } else if (
    e.target.classList.contains("bg-color-in") &&
    lastUsedBgOption == "solid"
  ) {
    // here also we add the solid color
    const solidColor = e.target.value;
    notesContainer.className = "notes-wrapper";
    notesContainer.style.background = solidColor;
    await chrome.storage.sync.set({ bgColor: solidColor });
  }
}
colorFrom.addEventListener("change", handleBgConfig);

//------------------------ font color & size
const fontForm = document.querySelector(".font-form");
async function handleFontSettings(e) {
  // real time change
  if (e.target.classList.contains("font-color-in")) {
    notesContainer.style.color = e.target.value;
    await chrome.storage.sync.set({
      fontColor: e.target.value,
    });
  } else {
    // must be the size
    notesContainer.style.fontSize = e.target.value + "px";
    await chrome.storage.sync.set({
      fontSize: e.target.value,
    });
  }
}
fontForm.addEventListener("change", handleFontSettings);

// create new note on press alt + a
document.addEventListener("keydown", (e) => {
  if (shortcutEnabled == "on") {
    if (e.keyCode == "65" && e.altKey) {
      createNote();
    }
  }
});
