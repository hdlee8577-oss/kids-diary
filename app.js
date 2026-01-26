const statusMap = {
  photo: document.getElementById("photo-status"),
  diary: document.getElementById("diary-status"),
};

const photoGrid = document.getElementById("photo-grid");
const diaryList = document.getElementById("diary-list");
const photoForm = document.getElementById("photo-form");
const diaryForm = document.getElementById("diary-form");

const modal = document.getElementById("photo-modal");
const modalImage = document.getElementById("modal-image");
const modalCaption = document.getElementById("modal-caption");
const modalClose = document.getElementById("modal-close");

const tabs = document.querySelectorAll(".tab-button");
const sections = document.querySelectorAll(".tab-section");

const config = window.APP_CONFIG || {};
const hasConfig = Boolean(config.supabaseUrl && config.supabaseAnonKey);

const supabase = hasConfig
  ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey)
  : null;

function setStatus(target, message, isError = false) {
  const element = statusMap[target];
  if (!element) {
    return;
  }
  element.textContent = message;
  element.classList.toggle("error", isError);
}

function showConfigMissing() {
  setStatus(
    "photo",
    "Missing config.js. Copy config.example.js and add Supabase keys.",
    true
  );
  setStatus(
    "diary",
    "Missing config.js. Copy config.example.js and add Supabase keys.",
    true
  );
  photoForm.querySelector("button").disabled = true;
  diaryForm.querySelector("button").disabled = true;
}

function toggleTab(targetId) {
  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.target === targetId);
  });
  sections.forEach((section) => {
    section.classList.toggle("active", section.id === targetId);
  });
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => toggleTab(tab.dataset.target));
});

function openModal(url, caption) {
  modalImage.src = url;
  modalCaption.textContent = caption || "No caption";
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  modalImage.src = "";
}

modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

function clearChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function renderPhotos(photos) {
  clearChildren(photoGrid);

  if (!photos.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No photos yet. Upload the first one!";
    photoGrid.appendChild(empty);
    return;
  }

  photos.forEach((photo) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "photo-card";
    card.addEventListener("click", () => openModal(photo.url, photo.caption));

    const img = document.createElement("img");
    img.src = photo.url;
    img.alt = photo.caption || "Gallery photo";

    const caption = document.createElement("p");
    caption.className = "photo-caption";
    caption.textContent = photo.caption || "Untitled photo";

    card.appendChild(img);
    card.appendChild(caption);
    photoGrid.appendChild(card);
  });
}

function renderDiary(entries) {
  clearChildren(diaryList);

  if (!entries.length) {
    const empty = document.createElement("li");
    empty.className = "muted";
    empty.textContent = "No entries yet. Save the first entry!";
    diaryList.appendChild(empty);
    return;
  }

  entries.forEach((entry) => {
    const item = document.createElement("li");
    item.className = "timeline-item";

    const date = document.createElement("div");
    date.className = "timeline-date";
    date.textContent = new Date(entry.entry_date).toLocaleDateString();

    const content = document.createElement("p");
    content.textContent = entry.content;

    item.appendChild(date);
    item.appendChild(content);
    diaryList.appendChild(item);
  });
}

async function loadPhotos() {
  if (!supabase) return;
  setStatus("photo", "Loading photos...");
  const { data, error } = await supabase
    .from("photos")
    .select("id, url, caption, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    setStatus("photo", error.message, true);
    return;
  }

  setStatus("photo", "");
  renderPhotos(data || []);
}

async function loadDiary() {
  if (!supabase) return;
  setStatus("diary", "Loading diary entries...");
  const { data, error } = await supabase
    .from("diary_entries")
    .select("id, entry_date, content, created_at")
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    setStatus("diary", error.message, true);
    return;
  }

  setStatus("diary", "");
  renderDiary(data || []);
}

function buildStoragePath(filename) {
  const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`;
}

photoForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!supabase) return;

  const fileInput = document.getElementById("photo-file");
  const captionInput = document.getElementById("photo-caption");
  const file = fileInput.files[0];

  if (!file) {
    setStatus("photo", "Choose a photo first.", true);
    return;
  }

  setStatus("photo", "Uploading photo...");

  const storagePath = buildStoragePath(file.name);
  const { error: uploadError } = await supabase.storage
    .from("photos")
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    setStatus("photo", uploadError.message, true);
    return;
  }

  const { data: publicData } = supabase.storage
    .from("photos")
    .getPublicUrl(storagePath);

  const publicUrl = publicData?.publicUrl;
  if (!publicUrl) {
    setStatus("photo", "Could not get public URL.", true);
    return;
  }

  const { error: insertError } = await supabase.from("photos").insert({
    url: publicUrl,
    caption: captionInput.value.trim(),
    storage_path: storagePath,
  });

  if (insertError) {
    setStatus("photo", insertError.message, true);
    return;
  }

  setStatus("photo", "Uploaded!");
  fileInput.value = "";
  captionInput.value = "";
  await loadPhotos();
});

diaryForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!supabase) return;

  const dateInput = document.getElementById("diary-date");
  const contentInput = document.getElementById("diary-content");
  const entryDate = dateInput.value;
  const content = contentInput.value.trim();

  if (!entryDate || !content) {
    setStatus("diary", "Date and entry are required.", true);
    return;
  }

  setStatus("diary", "Saving entry...");
  const { error } = await supabase.from("diary_entries").insert({
    entry_date: entryDate,
    content,
  });

  if (error) {
    setStatus("diary", error.message, true);
    return;
  }

  setStatus("diary", "Saved!");
  contentInput.value = "";
  await loadDiary();
});

if (!hasConfig) {
  showConfigMissing();
} else {
  loadPhotos();
  loadDiary();
}
