const form = document.getElementById("entry-form");
const statusEl = document.getElementById("entry-status");
const timelineEl = document.getElementById("timeline");
const emptyEl = document.getElementById("timeline-empty");

const supabase = window.getSupabaseClient();

function setStatus(message, type) {
  statusEl.textContent = message || "";
  statusEl.className = "status";
  if (type) {
    statusEl.classList.add(type);
  }
}

function setEmptyState(isEmpty) {
  emptyEl.classList.toggle("hidden", !isEmpty);
}

async function loadEntries() {
  setStatus("Loading entries...");

  const { data, error } = await supabase
    .from("diary_entries")
    .select("*")
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    setStatus(`Failed to load entries: ${error.message}`, "error");
    return;
  }

  renderEntries(data || []);
  setStatus("");
}

function renderEntries(entries) {
  timelineEl.innerHTML = "";

  if (!entries.length) {
    setEmptyState(true);
    return;
  }

  setEmptyState(false);
  const grouped = new Map();

  entries.forEach((entry) => {
    const dateKey = entry.entry_date || "Unknown date";
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey).push(entry);
  });

  grouped.forEach((items, dateKey) => {
    const groupEl = document.createElement("div");
    groupEl.className = "timeline-group";

    const dateEl = document.createElement("div");
    dateEl.className = "timeline-date";
    dateEl.textContent = dateKey;

    const entriesEl = document.createElement("div");
    entriesEl.className = "timeline-entries";

    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "entry-card";
      card.textContent = item.content;
      entriesEl.appendChild(card);
    });

    groupEl.append(dateEl, entriesEl);
    timelineEl.appendChild(groupEl);
  });
}

async function handleSubmit(event) {
  event.preventDefault();
  setStatus("");

  const entryDate = form.entryDate.value;
  const content = form.content.value.trim();

  if (!entryDate || !content) {
    setStatus("Please choose a date and write a note.", "error");
    return;
  }

  const { error } = await supabase.from("diary_entries").insert({
    entry_date: entryDate,
    content
  });

  if (error) {
    setStatus(`Failed to save entry: ${error.message}`, "error");
    return;
  }

  setStatus("Entry saved.", "success");
  form.reset();
  await loadEntries();
}

if (!supabase) {
  setStatus(
    "Supabase is not configured. Update supabase-config.js and reload.",
    "error"
  );
  form.querySelector("button").disabled = true;
} else {
  loadEntries();
  form.addEventListener("submit", handleSubmit);
}
