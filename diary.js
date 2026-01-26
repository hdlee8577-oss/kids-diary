import { supabase, isSupabaseConfigured } from "./supabaseClient.js";

const form = document.querySelector("#entry-form");
const dateInput = document.querySelector("#entry-date");
const contentInput = document.querySelector("#entry-content");
const entryStatus = document.querySelector("#entry-status");
const timelineStatus = document.querySelector("#timeline-status");
const timeline = document.querySelector("#timeline");
const emptyState = document.querySelector("#timeline-empty");
const refreshButton = document.querySelector("#refresh-entries");
const configBanner = document.querySelector("#config-banner");

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
    entryStatus,
    "Supabase is not configured. Update config.js first.",
    "warning"
  );
}

function setSubmitState(isLoading) {
  submitButton.disabled = isLoading;
  resetButton.disabled = isLoading;
  submitButton.textContent = isLoading ? "Saving..." : "Save entry";
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

function renderEntries(entries) {
  timeline.innerHTML = "";
  if (!entries || entries.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }
  emptyState.classList.add("hidden");

  entries.forEach((entry) => {
    const item = document.createElement("article");
    item.className = "timeline-item";

    const header = document.createElement("div");
    header.className = "timeline-header";

    const time = document.createElement("time");
    time.textContent = formatDate(entry.entry_date);
    if (entry.entry_date) {
      time.dateTime = entry.entry_date;
    }

    const meta = document.createElement("span");
    meta.textContent = entry.created_at
      ? `Added ${formatDate(entry.created_at)}`
      : "";

    const body = document.createElement("p");
    body.textContent = entry.content;

    header.append(time, meta);
    item.append(header, body);
    timeline.append(item);
  });
}

async function loadEntries() {
  if (!isSupabaseConfigured) {
    return;
  }

  refreshButton.disabled = true;
  refreshButton.textContent = "Loading...";
  setStatus(timelineStatus, "", null);

  const { data, error } = await supabase
    .from("entries")
    .select("id, entry_date, content, created_at")
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false });

  refreshButton.disabled = false;
  refreshButton.textContent = "Refresh";

  if (error) {
    setStatus(
      timelineStatus,
      `Failed to load entries: ${error.message}`,
      "error"
    );
    return;
  }

  renderEntries(data);
}

async function handleSubmit(event) {
  event.preventDefault();

  if (!isSupabaseConfigured) {
    setStatus(
      entryStatus,
      "Supabase is not configured. Update config.js first.",
      "warning"
    );
    return;
  }

  const entryDate = dateInput.value || new Date().toISOString().slice(0, 10);
  const content = contentInput.value.trim();

  if (!content) {
    setStatus(entryStatus, "Please write a short entry.", "warning");
    return;
  }

  setSubmitState(true);
  setStatus(entryStatus, "", null);

  const { error } = await supabase.from("entries").insert({
    entry_date: entryDate,
    content
  });

  setSubmitState(false);

  if (error) {
    setStatus(
      entryStatus,
      `Save failed: ${error.message}`,
      "error"
    );
    return;
  }

  form.reset();
  dateInput.value = new Date().toISOString().slice(0, 10);
  setStatus(entryStatus, "Entry saved successfully.", "success");
  await loadEntries();
}

refreshButton.addEventListener("click", loadEntries);
form.addEventListener("submit", handleSubmit);

dateInput.value = new Date().toISOString().slice(0, 10);
showConfigWarning();
if (isSupabaseConfigured) {
  loadEntries();
}
