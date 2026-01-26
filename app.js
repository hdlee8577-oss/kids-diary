const configWarning = document.getElementById("config-warning");

function showWarning(message) {
  if (!configWarning) {
    return;
  }
  configWarning.textContent = message;
  configWarning.style.display = "block";
}

function hideWarning() {
  if (!configWarning) {
    return;
  }
  configWarning.style.display = "none";
}

function hasPlaceholder(value) {
  return !value || value.includes("YOUR_");
}

function createSupabaseClient() {
  if (!window.supabase) {
    showWarning("Supabase library not loaded. Check the CDN script tag.");
    return null;
  }

  const url = window.SUPABASE_URL;
  const anonKey = window.SUPABASE_ANON_KEY;

  if (hasPlaceholder(url) || hasPlaceholder(anonKey)) {
    showWarning(
      "Supabase config missing. Update config.js with your project URL and anon key."
    );
    return null;
  }

  hideWarning();
  return supabase.createClient(url, anonKey);
}

function setStatus(element, message, isError = false) {
  if (!element) {
    return;
  }
  element.textContent = message;
  element.style.color = isError ? "#b91c1c" : "#111827";
}

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function setupGallery() {
  const supabaseClient = createSupabaseClient();
  const galleryGrid = document.getElementById("gallery-grid");
  const uploadForm = document.getElementById("photo-upload-form");
  const fileInput = document.getElementById("photo-input");
  const uploadStatus = document.getElementById("upload-status");
  const modal = document.getElementById("photo-modal");
  const modalImage = document.getElementById("modal-image");
  const modalClose = document.getElementById("modal-close");

  if (!galleryGrid || !uploadForm || !fileInput) {
    return;
  }

  if (!supabaseClient) {
    return;
  }

  const bucket = window.SUPABASE_STORAGE_BUCKET || "photos";

  function openModal(url, altText) {
    if (!modal || !modalImage) {
      return;
    }
    modalImage.src = url;
    modalImage.alt = altText;
    modal.classList.add("active");
  }

  function closeModal() {
    if (!modal) {
      return;
    }
    modal.classList.remove("active");
  }

  if (modalClose) {
    modalClose.addEventListener("click", closeModal);
  }

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });
  }

  async function loadGallery() {
    setStatus(uploadStatus, "Loading photos...");
    galleryGrid.innerHTML = "";

    const { data, error } = await supabaseClient
      .from("photos")
      .select("id, public_url, original_name, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      setStatus(uploadStatus, `Failed to load photos: ${error.message}`, true);
      return;
    }

    if (!data || data.length === 0) {
      setStatus(uploadStatus, "No photos yet. Upload the first one!");
      return;
    }

    setStatus(uploadStatus, `${data.length} photo(s) loaded.`);

    data.forEach((photo) => {
      const item = document.createElement("div");
      item.className = "gallery-item";

      const image = document.createElement("img");
      image.src = photo.public_url;
      image.alt = photo.original_name || "Photo";

      item.appendChild(image);
      item.addEventListener("click", () =>
        openModal(photo.public_url, photo.original_name || "Photo")
      );

      galleryGrid.appendChild(item);
    });
  }

  uploadForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const files = Array.from(fileInput.files || []);

    if (files.length === 0) {
      setStatus(uploadStatus, "Select at least one photo first.", true);
      return;
    }

    const submitButton = uploadForm.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
    }

    setStatus(uploadStatus, "Uploading photos...");

    for (const file of files) {
      const safeName = sanitizeFilename(file.name);
      const uniquePrefix = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 10)}`;
      const filePath = `${uniquePrefix}-${safeName}`;

      const { error: uploadError } = await supabaseClient.storage
        .from(bucket)
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        setStatus(
          uploadStatus,
          `Upload failed for ${file.name}: ${uploadError.message}`,
          true
        );
        continue;
      }

      const { data: publicData } = supabaseClient.storage
        .from(bucket)
        .getPublicUrl(filePath);

      const publicUrl = publicData?.publicUrl;

      const { error: insertError } = await supabaseClient.from("photos").insert({
        file_path: filePath,
        public_url: publicUrl,
        original_name: file.name,
      });

      if (insertError) {
        setStatus(
          uploadStatus,
          `Saved upload but failed to record metadata: ${insertError.message}`,
          true
        );
      }
    }

    fileInput.value = "";
    await loadGallery();

    if (submitButton) {
      submitButton.disabled = false;
    }
  });

  await loadGallery();
}

async function setupDiary() {
  const supabaseClient = createSupabaseClient();
  const entryForm = document.getElementById("entry-form");
  const dateInput = document.getElementById("entry-date");
  const contentInput = document.getElementById("entry-content");
  const entryStatus = document.getElementById("entry-status");
  const timeline = document.getElementById("timeline");

  if (!entryForm || !dateInput || !contentInput || !timeline) {
    return;
  }

  if (!supabaseClient) {
    return;
  }

  if (!dateInput.value) {
    const today = new Date().toISOString().slice(0, 10);
    dateInput.value = today;
  }

  async function loadEntries() {
    setStatus(entryStatus, "Loading entries...");
    timeline.innerHTML = "";

    const { data, error } = await supabaseClient
      .from("entries")
      .select("id, entry_date, content, created_at")
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      setStatus(entryStatus, `Failed to load entries: ${error.message}`, true);
      return;
    }

    if (!data || data.length === 0) {
      setStatus(entryStatus, "No entries yet. Write the first one!");
      return;
    }

    setStatus(entryStatus, `${data.length} entry(ies) loaded.`);

    data.forEach((entry) => {
      const entryCard = document.createElement("div");
      entryCard.className = "entry";

      const date = document.createElement("div");
      date.className = "entry-date";
      date.textContent = entry.entry_date;

      const content = document.createElement("div");
      content.className = "entry-content";
      content.textContent = entry.content;

      entryCard.appendChild(date);
      entryCard.appendChild(content);
      timeline.appendChild(entryCard);
    });
  }

  entryForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const entryDate = dateInput.value;
    const contentValue = contentInput.value.trim();

    if (!entryDate || !contentValue) {
      setStatus(entryStatus, "Date and content are required.", true);
      return;
    }

    const submitButton = entryForm.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
    }

    setStatus(entryStatus, "Saving entry...");

    const { error } = await supabaseClient.from("entries").insert({
      entry_date: entryDate,
      content: contentValue,
    });

    if (error) {
      setStatus(entryStatus, `Failed to save entry: ${error.message}`, true);
    } else {
      setStatus(entryStatus, "Entry saved.");
      contentInput.value = "";
      await loadEntries();
    }

    if (submitButton) {
      submitButton.disabled = false;
    }
  });

  await loadEntries();
}

setupGallery();
setupDiary();
