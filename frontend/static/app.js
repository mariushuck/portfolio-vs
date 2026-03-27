const entities = [
  {
    id: "kategorien",
    title: "Kategorien",
    subtitle: "Material- und Bekleidungskategorien verwalten",
    icon: "fa-layer-group",
    apiBase: "/api/kleidung",
    resource: "/kategorien",
    idKey: "id",
    fields: [
      {
        key: "bezeichnung",
        label: "Bezeichnung",
        type: "text",
        required: true,
      },
      {
        key: "materialtyp",
        label: "Materialtyp",
        type: "text",
        required: true,
      },
    ],
  },
  {
    id: "kleidungsstuecke",
    title: "Kleidungsstuecke",
    subtitle: "Kleidungsdaten inkl. Kategoriezuordnung",
    icon: "fa-shirt",
    apiBase: "/api/kleidung",
    resource: "/kleidungsstuecke",
    idKey: "id",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      {
        key: "kategorieId",
        label: "Kategorie-ID",
        type: "number",
        required: true,
      },
      { key: "farbe", label: "Farbe", type: "text", required: false },
    ],
  },
  {
    id: "waschprogramme",
    title: "Waschprogramme",
    subtitle: "Parameter fuer Programme wie Temperatur und Dauer",
    icon: "fa-sliders",
    apiBase: "/api/wasch",
    resource: "/waschprogramme",
    idKey: "id",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      {
        key: "temperatur",
        label: "Temperatur (Grad)",
        type: "number",
        required: true,
      },
      {
        key: "dauer",
        label: "Dauer (Minuten)",
        type: "number",
        required: true,
      },
    ],
  },
  {
    id: "empfehlungen",
    title: "Empfehlungen",
    subtitle: "Verknuepfung zwischen Kategorie und Waschprogramm",
    icon: "fa-wand-magic-sparkles",
    apiBase: "/api/wasch",
    resource: "/empfehlungen",
    idKey: "kategorieId",
    fields: [
      {
        key: "kategorieId",
        label: "Kategorie-ID",
        type: "number",
        required: true,
      },
      {
        key: "waschprogrammId",
        label: "Waschprogramm-ID",
        type: "number",
        required: true,
      },
    ],
  },
  {
    id: "waschgaenge",
    title: "Waschgaenge",
    subtitle: "Laufende oder geplante Waschvorgaenge",
    icon: "fa-water",
    apiBase: "/api/wasch",
    resource: "/waschgaenge",
    idKey: "id",
    fields: [
      {
        key: "waschprogrammId",
        label: "Waschprogramm-ID",
        type: "number",
        required: true,
      },
      {
        key: "zeitstempel",
        label: "Zeitstempel (ISO)",
        type: "datetime-local",
        required: false,
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        required: false,
        options: ["geplant", "in_bearbeitung", "abgeschlossen"],
      },
    ],
  },
];

const state = {
  activeEntityId: entities[0].id,
  rows: [],
  loading: false,
  editorMode: "create",
  editorItem: null,
  deleteItem: null,
};

const ui = {
  entityNav: document.getElementById("entityNav"),
  viewTitle: document.getElementById("viewTitle"),
  viewSubtitle: document.getElementById("viewSubtitle"),
  tableContainer: document.getElementById("tableContainer"),
  cardsContainer: document.getElementById("cardsContainer"),
  statsBar: document.getElementById("statsBar"),
  refreshBtn: document.getElementById("refreshBtn"),
  createBtn: document.getElementById("createBtn"),

  editorBackdrop: document.getElementById("editorBackdrop"),
  editorTitle: document.getElementById("editorTitle"),
  editorFields: document.getElementById("editorFields"),
  editorForm: document.getElementById("editorForm"),
  requestMethod: document.getElementById("requestMethod"),
  closeEditorBtn: document.getElementById("closeEditorBtn"),
  patchFieldsWrap: document.getElementById("patchFieldsWrap"),
  patchFieldsInput: document.getElementById("patchFieldsInput"),

  deleteBackdrop: document.getElementById("deleteBackdrop"),
  deletePreview: document.getElementById("deletePreview"),
  cancelDeleteBtn: document.getElementById("cancelDeleteBtn"),
  confirmDeleteBtn: document.getElementById("confirmDeleteBtn"),

  toastHost: document.getElementById("toastHost"),
};

init();

function init() {
  renderNav();
  attachEvents();
  refreshActiveEntity();
}

function attachEvents() {
  ui.refreshBtn.addEventListener("click", () => refreshActiveEntity());
  ui.createBtn.addEventListener("click", () => openEditor("create", null));

  ui.closeEditorBtn.addEventListener("click", closeEditor);
  ui.editorBackdrop.addEventListener("click", (event) => {
    if (event.target === ui.editorBackdrop) {
      closeEditor();
    }
  });

  ui.editorForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitEditor();
  });

  ui.requestMethod.addEventListener("change", () => {
    const isPatch = ui.requestMethod.value === "PATCH";
    ui.patchFieldsWrap.classList.toggle("hidden", !isPatch);
  });

  ui.cancelDeleteBtn.addEventListener("click", closeDeleteDialog);
  ui.deleteBackdrop.addEventListener("click", (event) => {
    if (event.target === ui.deleteBackdrop) {
      closeDeleteDialog();
    }
  });
  ui.confirmDeleteBtn.addEventListener("click", async () => {
    await executeDelete();
  });
}

function renderNav() {
  ui.entityNav.innerHTML = "";

  for (const entity of entities) {
    const button = document.createElement("button");
    button.className = [
      "nav-item",
      "rounded-2xl",
      "px-3",
      "py-2.5",
      "text-left",
      "flex",
      "items-center",
      "gap-3",
      "w-full",
    ].join(" ");

    if (entity.id === state.activeEntityId) {
      button.classList.add("active");
    }

    button.innerHTML = `
      <span class="grid h-9 w-9 place-items-center rounded-xl bg-white text-brand-700">
        <i class="fa-solid ${entity.icon}"></i>
      </span>
      <span>
        <span class="block text-sm font-semibold">${entity.title}</span>
        <span class="block text-xs text-ink-500">${entity.resource}</span>
      </span>
    `;

    button.addEventListener("click", () => {
      state.activeEntityId = entity.id;
      renderNav();
      refreshActiveEntity();
    });

    ui.entityNav.appendChild(button);
  }
}

function getActiveEntity() {
  return entities.find((entity) => entity.id === state.activeEntityId);
}

async function refreshActiveEntity() {
  const entity = getActiveEntity();
  setLoading(true);

  ui.viewTitle.textContent = entity.title;
  ui.viewSubtitle.textContent = entity.subtitle;

  try {
    const rows = await apiRequest(`${entity.apiBase}${entity.resource}`);
    state.rows = Array.isArray(rows) ? rows : [];

    renderStats(entity, state.rows);
    renderTable(entity, state.rows);
    renderCards(entity, state.rows);
  } catch (error) {
    showToast(error.message || "Daten konnten nicht geladen werden", "error");
    state.rows = [];
    renderStats(entity, []);
    renderTable(entity, []);
    renderCards(entity, []);
  } finally {
    setLoading(false);
  }
}

function renderStats(entity, rows) {
  const ids = rows
    .map((row) => row[entity.idKey])
    .filter((id) => Number.isInteger(Number(id)));
  const maxId = ids.length ? Math.max(...ids.map((id) => Number(id))) : 0;

  const cards = [
    {
      label: "Anzahl Eintraege",
      value: String(rows.length),
      icon: "fa-database",
    },
    {
      label: "Naechster ID-Vorschlag",
      value: String(maxId + 1),
      icon: "fa-arrow-up-right-dots",
    },
    {
      label: "Aktive Route",
      value: entity.resource,
      icon: "fa-route",
    },
  ];

  ui.statsBar.innerHTML = cards
    .map(
      (card) => `
      <article class="rounded-2xl border border-white/60 bg-white/75 p-4">
        <p class="text-xs uppercase tracking-[0.12em] text-ink-500">${card.label}</p>
        <p class="mt-1 text-xl font-semibold">${escapeHtml(card.value)}</p>
        <i class="fa-solid ${card.icon} mt-2 text-brand-700"></i>
      </article>
    `,
    )
    .join("");
}

function renderTable(entity, rows) {
  if (!rows.length) {
    ui.tableContainer.innerHTML = emptyState();
    return;
  }

  const keys = collectKeys(rows, entity.fields);

  const header = keys
    .map((key) => `<th>${escapeHtml(prettyLabel(key))}</th>`)
    .join("");

  const body = rows
    .map((row) => {
      const cells = keys
        .map((key) => `<td>${escapeHtml(formatValue(row[key]))}</td>`)
        .join("");

      return `
        <tr class="hover:bg-white/80 transition-colors">
          ${cells}
          <td>
            <div class="flex gap-2">
              <button class="btn-secondary rounded-lg px-2.5 py-1.5 text-xs" data-action="edit" data-id="${String(
                row[entity.idKey],
              )}">
                <i class="fa-solid fa-pen mr-1"></i>Bearbeiten
              </button>
              <button class="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs text-red-700 transition hover:bg-red-100" data-action="delete" data-id="${String(
                row[entity.idKey],
              )}">
                <i class="fa-solid fa-trash mr-1"></i>Loeschen
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  ui.tableContainer.innerHTML = `
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            ${header}
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;

  bindActionButtons();
}

function renderCards(entity, rows) {
  if (!rows.length) {
    ui.cardsContainer.innerHTML = "";
    return;
  }

  const keys = collectKeys(rows, entity.fields);

  ui.cardsContainer.innerHTML = rows
    .map((row) => {
      const lines = keys
        .map(
          (key) => `
            <div class="record-row">
              <span class="record-key">${escapeHtml(prettyLabel(key))}</span>
              <span class="record-value">${escapeHtml(formatValue(row[key]))}</span>
            </div>
          `,
        )
        .join("");

      return `
        <article class="card-item">
          <div class="record-grid">${lines}</div>
          <div class="mt-4 flex gap-2">
            <button class="btn-secondary rounded-lg px-2.5 py-1.5 text-xs" data-action="edit" data-id="${String(
              row[entity.idKey],
            )}">
              <i class="fa-solid fa-pen mr-1"></i>Bearbeiten
            </button>
            <button class="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs text-red-700 transition hover:bg-red-100" data-action="delete" data-id="${String(
              row[entity.idKey],
            )}">
              <i class="fa-solid fa-trash mr-1"></i>Loeschen
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  bindActionButtons();
}

function bindActionButtons() {
  const buttons = document.querySelectorAll("[data-action]");

  buttons.forEach((button) => {
    const action = button.getAttribute("data-action");
    const id = button.getAttribute("data-id");
    const entity = getActiveEntity();
    const item = state.rows.find(
      (row) => String(row[entity.idKey]) === String(id),
    );

    if (!item) {
      return;
    }

    if (action === "edit") {
      button.addEventListener("click", () => openEditor("edit", item));
    }

    if (action === "delete") {
      button.addEventListener("click", () => openDeleteDialog(item));
    }
  });
}

function openEditor(mode, item) {
  const entity = getActiveEntity();
  state.editorMode = mode;
  state.editorItem = item;

  ui.editorTitle.textContent =
    mode === "create"
      ? `${entity.title} anlegen`
      : `${entity.title} aktualisieren`;

  ui.requestMethod.value = mode === "create" ? "POST" : "PUT";
  ui.requestMethod.disabled = mode === "create";
  ui.patchFieldsWrap.classList.add("hidden");
  ui.patchFieldsInput.value = "";

  renderEditorFields(entity, mode, item);
  ui.editorBackdrop.classList.remove("hidden");
}

function closeEditor() {
  state.editorItem = null;
  ui.editorBackdrop.classList.add("hidden");
}

function renderEditorFields(entity, mode, item) {
  ui.editorFields.innerHTML = "";

  entity.fields.forEach((field) => {
    const value = item?.[field.key] ?? "";
    const wrapper = document.createElement("label");
    wrapper.className = "grid gap-1";

    const label = document.createElement("span");
    label.className = "field-label";
    label.textContent = field.label;

    let input;

    if (field.type === "select") {
      input = document.createElement("select");
      input.className = "field-input";

      const options = ["", ...(field.options || [])];
      options.forEach((option) => {
        const node = document.createElement("option");
        node.value = option;
        node.textContent = option || "Bitte waehlen";
        if (String(value) === option) {
          node.selected = true;
        }
        input.appendChild(node);
      });
    } else {
      input = document.createElement("input");
      input.className = "field-input";
      input.type =
        field.type === "datetime-local" ? "datetime-local" : field.type;

      if (field.type === "datetime-local" && value) {
        input.value = isoToLocalDate(value);
      } else {
        input.value = value;
      }
    }

    input.setAttribute("name", field.key);
    input.setAttribute("data-type", field.type);

    if (field.required && mode === "create") {
      input.required = true;
    }

    if (mode === "edit" && field.key === entity.idKey) {
      input.readOnly = true;
      input.classList.add("opacity-75");
    }

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    ui.editorFields.appendChild(wrapper);
  });
}

async function submitEditor() {
  const entity = getActiveEntity();
  const method = ui.requestMethod.value;
  const payload = buildPayload(entity, method);

  const hasId =
    state.editorMode === "edit" &&
    state.editorItem?.[entity.idKey] !== undefined;
  const id = hasId ? String(state.editorItem[entity.idKey]) : "";

  const url =
    method === "POST"
      ? `${entity.apiBase}${entity.resource}`
      : `${entity.apiBase}${entity.resource}/${encodeURIComponent(id)}`;

  try {
    await apiRequest(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    closeEditor();
    await refreshActiveEntity();
    showToast(`${method} erfolgreich ausgefuehrt`, "success");
  } catch (error) {
    showToast(error.message || "Aktion fehlgeschlagen", "error");
  }
}

function buildPayload(entity, method) {
  const payload = {};
  const formData = new FormData(ui.editorForm);

  entity.fields.forEach((field) => {
    const raw = formData.get(field.key);

    if (raw === null) {
      return;
    }

    const value = normalizeValue(raw, field.type);

    if (method === "PATCH") {
      const allowed = parsePatchFieldList();
      if (!allowed.has(field.key)) {
        return;
      }
    }

    if (value === "") {
      if (field.required && method !== "PATCH") {
        payload[field.key] = "";
      }
      return;
    }

    if (field.type === "datetime-local") {
      payload[field.key] = localDateToIso(value);
      return;
    }

    payload[field.key] = value;
  });

  if (
    method === "PUT" &&
    state.editorMode === "edit" &&
    entity.idKey === "kategorieId"
  ) {
    payload.kategorieId = Number(state.editorItem.kategorieId);
  }

  return payload;
}

function parsePatchFieldList() {
  const raw = ui.patchFieldsInput.value.trim();

  if (!raw) {
    return new Set(
      Array.from(ui.editorFields.querySelectorAll("[name]")).map(
        (input) => input.name,
      ),
    );
  }

  return new Set(
    raw
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean),
  );
}

function openDeleteDialog(item) {
  state.deleteItem = item;
  ui.deletePreview.textContent = JSON.stringify(item, null, 2);
  ui.deleteBackdrop.classList.remove("hidden");
}

function closeDeleteDialog() {
  state.deleteItem = null;
  ui.deleteBackdrop.classList.add("hidden");
}

async function executeDelete() {
  const entity = getActiveEntity();

  if (!state.deleteItem) {
    return;
  }

  const id = state.deleteItem[entity.idKey];

  try {
    await apiRequest(
      `${entity.apiBase}${entity.resource}/${encodeURIComponent(String(id))}`,
      {
        method: "DELETE",
      },
    );

    closeDeleteDialog();
    await refreshActiveEntity();
    showToast("Eintrag erfolgreich geloescht", "success");
  } catch (error) {
    showToast(error.message || "Loeschen fehlgeschlagen", "error");
  }
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, options);
  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      `${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  return payload;
}

function showToast(message, type) {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="mt-0.5"><i class="fa-solid ${
      type === "success" ? "fa-circle-check" : "fa-triangle-exclamation"
    }"></i></span>
    <div>
      <p class="text-xs uppercase tracking-[0.18em] opacity-90">${
        type === "success" ? "Success" : "Error"
      }</p>
      <p class="mt-1 text-sm">${escapeHtml(message)}</p>
    </div>
  `;

  ui.toastHost.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(4px)";
  }, 2800);

  setTimeout(() => {
    toast.remove();
  }, 3200);
}

function setLoading(isLoading) {
  state.loading = isLoading;
  ui.refreshBtn.disabled = isLoading;
  ui.createBtn.disabled = isLoading;

  if (isLoading) {
    ui.viewSubtitle.textContent = "Lade Daten...";
  }
}

function collectKeys(rows, schemaFields) {
  const keys = new Set(schemaFields.map((field) => field.key));

  rows.forEach((row) => {
    Object.keys(row).forEach((key) => keys.add(key));
  });

  return Array.from(keys);
}

function normalizeValue(raw, type) {
  const value = typeof raw === "string" ? raw.trim() : raw;

  if (type === "number") {
    if (value === "") {
      return "";
    }
    return Number(value);
  }

  return value;
}

function localDateToIso(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  return date.toISOString();
}

function isoToLocalDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.valueOf())) {
    return "";
  }

  const pad = (num) => String(num).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

function prettyLabel(value) {
  return value
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/(^|\s)(\w)/g, (_, p1, p2) => `${p1}${p2.toUpperCase()}`);
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function emptyState() {
  return `
    <div class="grid place-items-center p-10 text-center">
      <div>
        <div class="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-100 text-brand-700">
          <i class="fa-solid fa-box-open text-xl"></i>
        </div>
        <h4 class="mt-4 font-display text-xl">Noch keine Daten vorhanden</h4>
        <p class="mt-2 max-w-sm text-sm text-ink-700">
          Erstelle den ersten Datensatz ueber den Button "Neu anlegen".
        </p>
      </div>
    </div>
  `;
}
