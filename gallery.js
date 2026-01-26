import { supabase, isSupabaseConfigured } from "./supabaseClient.js";

const form = document.querySelector("#upload-form");
const titleInput = document.querySelector("#photo-title");
const fileInput = document.querySelector("#photo-file");
const uploadStatus = document.querySelector("#upload-status");
const galleryStatus = document.querySelector("#gallery-status");
const grid = document.querySelector("#gallery-grid");
const emptyState = document.querySelector("#gallery-empty");
const refreshButton = document.querySelector("#refresh-gallery");
const configBanner = document.querySelector("#config-banner");

const modal = document.querySelector("#photo-modal");
const modalImage = document.querySelector("#modal-image");
const modalTitle = document.querySelector("#modal-title");
const modalDate = document.querySelector("#modal-date");
const modalClose = document.querySelector(".modal-close");

const submitButton = form.querySelector("button[type='submit']");
const resetButton = form.querySelector("button[type='reset']");

const STATUS_CLASSES = ["status-success", "status-error", "status-warning"];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric"
});

function setStatus(element, message, type) {
  element.textContent = message;
  element.classList.remove(...STATUS_CLASSES);
  if (type) {
    element.classList.add(`status-${type}`);
  }
}

function showConfigWarning() {
  if (isSupabaseConfigured) {
    return;
  }
  configBanner.classList.remove("hidden");
  submitButton.disabled = true;
  resetButton.disabled = true;
  refreshButton.disabled = true;
  setStatus(
    uploadStatus,
    "Supabase is not configured. Update config.js first.",
    "warning"
  );
}

function setUploadState(isLoading) {
  submitButton.disabled = isLoading;
  resetButton.disabled = isLoading;
  submitButton.textContent = isLoading ? "Uploading..." : "Upload";
}

function formatDate(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return dateFormatter.format(date);
}

function getRandomId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

function openModal({ title, createdAt, url }) {
  modalImage.src = url;
  modalImage.alt = title || "Photo";
  modalTitle.textContent = title || "Untitled photo";
  modalDate.textContent = createdAt ? `Added ${formatDate(createdAt)}` : "";
  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
  modalImage.src = "";
  modalImage.alt = "";
}

function renderPhotos(photos) {
  grid.innerHTML = "";
  if (!photos || photos.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }
  emptyState.classList.add("hidden");

  photos.forEach((photo) => {
    const { data } = supabase.storage
      .from("photos")
      .getPublicUrl(photo.storage_path);
    const card = document.createElement("button");
    card.type = "button";
    card.className = "gallery-card";

    const img = document.createElement("img");
    img.src = data?.publicUrl || "";
    img.alt = photo.title || "Photo";

    const meta = document.createElement("div");
    meta.className = "gallery-meta";

    const title = document.createElement("h3");
    title.textContent = photo.title || "Untitled photo";

    const time = document.createElement("time");
    time.textContent = formatDate(photo.created_at);
    if (photo.created_at) {
      time.dateTime = photo.created_at;
    }

    meta.append(title, time);
    card.append(img, meta);
    card.addEventListener("click", () =>
      openModal({
        title: photo.title,
        createdAt: photo.created_at,
        url: data?.publicUrl || ""
      })
    );

    grid.append(card);
  });
}

async function loadPhotos() {
  if (!isSupabaseConfigured) {
    return;
  }

  refreshButton.disabled = true;
  refreshButton.textContent = "Loading...";
  setStatus(galleryStatus, "", null);

  const { data, error } = await supabase
    .from("photos")
    .select("id, title, created_at, storage_path")
    .order("created_at", { ascending: false });

  refreshButton.disabled = false;
  refreshButton.textContent = "Refresh";

  if (error) {
    setStatus(
      galleryStatus,
      `Failed to load photos: ${error.message}`,
      "error"
    );
    return;
  }

  renderPhotos(data);
}

async function handleUpload(event) {
  event.preventDefault();

  if (!isSupabaseConfigured) {
    setStatus(
      uploadStatus,
      "Supabase is not configured. Update config.js first.",
      "warning"
    );
    return;
  }

  const file = fileInput.files[0];
  if (!file) {
    setStatus(uploadStatus, "Please choose an image file.", "warning");
    return;
  }
  if (!file.type.startsWith("image/")) {
    setStatus(uploadStatus, "Only image files are allowed.", "warning");
    return;
  }

  setUploadState(true);
  setStatus(uploadStatus, "", null);

  const extension = file.name.includes(".")
    ? file.name.split(".").pop()
    : "png";
  const filePath = `${Date.now()}-${getRandomId()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("photos")
    .upload(filePath, file, { contentType: file.type });

  if (uploadError) {
    setUploadState(false);
    setStatus(
      uploadStatus,
      `Upload failed: ${uploadError.message}`,
      "error"
    );
    return;
  }

  const title = titleInput.value.trim();
  const { error: insertError } = await supabase.from("photos").insert({
    title: title || null,
    storage_path: filePath
  });

  setUploadState(false);

  if (insertError) {
    setStatus(
      uploadStatus,
      `Save failed: ${insertError.message}`,
      "error"
    );
    return;
  }

  form.reset();
  setStatus(uploadStatus, "Photo uploaded successfully.", "success");
  await loadPhotos();
}

refreshButton.addEventListener("click", loadPhotos);
form.addEventListener("submit", handleUpload);
modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.classList.contains("hidden")) {
    closeModal();
  }
});

showConfigWarning();
if (isSupabaseConfigured) {
  loadPhotos();
}
