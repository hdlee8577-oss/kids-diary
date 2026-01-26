const form = document.getElementById("upload-form");
const statusEl = document.getElementById("upload-status");
const gridEl = document.getElementById("gallery-grid");
const emptyStateEl = document.getElementById("empty-state");
const lightboxEl = document.getElementById("lightbox");
const lightboxImageEl = document.getElementById("lightbox-image");
const lightboxCaptionEl = document.getElementById("lightbox-caption");
const lightboxCloseEl = document.getElementById("lightbox-close");

const maxFileSize = 5 * 1024 * 1024;
const supabase = window.getSupabaseClient();

function setStatus(message, type) {
  statusEl.textContent = message || "";
  statusEl.className = "status";
  if (type) {
    statusEl.classList.add(type);
  }
}

function setEmptyState(isEmpty) {
  emptyStateEl.classList.toggle("hidden", !isEmpty);
}

function openLightbox(photo) {
  lightboxImageEl.src = photo.url;
  lightboxImageEl.alt = photo.title || "Photo";
  lightboxCaptionEl.textContent = photo.title || "Untitled";
  lightboxEl.classList.remove("hidden");
  lightboxEl.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
}

function closeLightbox() {
  lightboxEl.classList.add("hidden");
  lightboxEl.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
}

async function loadPhotos() {
  setStatus("Loading photos...");
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    setStatus(`Failed to load photos: ${error.message}`, "error");
    return;
  }

  renderPhotos(data || []);
  setStatus("");
}

function renderPhotos(photos) {
  gridEl.innerHTML = "";

  if (!photos.length) {
    setEmptyState(true);
    return;
  }

  setEmptyState(false);

  photos.forEach((photo) => {
    if (!photo.file_path) {
      return;
    }

    const { data } = supabase.storage.from("photos").getPublicUrl(photo.file_path);
    const url = data.publicUrl;

    const card = document.createElement("button");
    card.type = "button";
    card.className = "gallery-card";

    const img = document.createElement("img");
    img.src = url;
    img.alt = photo.title || "Photo";

    const title = document.createElement("div");
    title.className = "gallery-title";
    title.textContent = photo.title || "Untitled";

    card.append(img, title);
    card.addEventListener("click", () => openLightbox({ url, title: photo.title }));

    gridEl.appendChild(card);
  });
}

async function handleUpload(event) {
  event.preventDefault();
  setStatus("");

  const title = form.title.value.trim();
  const file = form.file.files[0];

  if (!file) {
    setStatus("Please choose an image file.", "error");
    return;
  }

  if (file.size > maxFileSize) {
    setStatus("File is too large. Please use a smaller image.", "error");
    return;
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `uploads/${Date.now()}_${safeName}`;

  setStatus("Uploading...");

  const { error: uploadError } = await supabase
    .storage
    .from("photos")
    .upload(filePath, file, { cacheControl: "3600", upsert: false });

  if (uploadError) {
    setStatus(`Upload failed: ${uploadError.message}`, "error");
    return;
  }

  const { error: insertError } = await supabase.from("photos").insert({
    title,
    file_path: filePath
  });

  if (insertError) {
    setStatus(`Saved file, but metadata failed: ${insertError.message}`, "error");
    return;
  }

  setStatus("Photo saved.", "success");
  form.reset();
  await loadPhotos();
}

if (!supabase) {
  setStatus(
    "Supabase is not configured. Update supabase-config.js and reload.",
    "error"
  );
  form.querySelector("button").disabled = true;
} else {
  loadPhotos();
  form.addEventListener("submit", handleUpload);
}

lightboxCloseEl.addEventListener("click", closeLightbox);
lightboxEl.addEventListener("click", (event) => {
  if (event.target === lightboxEl) {
    closeLightbox();
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !lightboxEl.classList.contains("hidden")) {
    closeLightbox();
  }
});
