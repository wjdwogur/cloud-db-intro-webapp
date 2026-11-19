// One-page self-introduction app.
// Data access is isolated in `api` so it can be swapped for AppSync GraphQL calls later
// (listProjects / getProject / listEntries / createEntry).
(function () {
  "use strict";

  const PAGE_SIZE = 10;
  const GB_KEY = "guestbook.entries.v1";

  // ---------- Data layer (temporary: static data + localStorage) ----------
  const api = {
    async listProjects() {
      return [...window.PROJECTS].sort((a, b) => a.displayOrder - b.displayOrder);
    },
    async getProject(projectId) {
      const p = window.PROJECTS.find((x) => x.projectId === projectId);
      if (!p) throw new Error("not found");
      return p;
    },
    async listEntries(limit, nextToken) {
      const all = readEntries().sort((a, b) => (a.sk < b.sk ? 1 : -1)); // newest first
      const start = nextToken ? Number(nextToken) : 0;
      const items = all.slice(start, start + limit);
      const next = start + limit < all.length ? String(start + limit) : null;
      return { items, nextToken: next };
    },
    async createEntry(name, message) {
      // Server-side style re-validation (AppSync resolver will do the same).
      const v = validate(name, message);
      if (!v.ok) throw new Error("validation");
      const createdAt = new Date().toISOString();
      const entryId = Math.random().toString(36).slice(2, 10);
      const entry = { pk: "GUESTBOOK", sk: createdAt + "#" + entryId, entryId, createdAt, name: v.name, message: v.message };
      const all = readEntries();
      all.push(entry);
      writeEntries(all);
      return entry;
    }
  };

  function readEntries() {
    try { return JSON.parse(localStorage.getItem(GB_KEY)) || []; } catch { return []; }
  }
  function writeEntries(list) {
    try { localStorage.setItem(GB_KEY, JSON.stringify(list)); } catch { /* storage unavailable */ }
  }

  // ---------- Helpers ----------
  const $ = (sel) => document.querySelector(sel);
  function el(tag, props, children) {
    const node = document.createElement(tag);
    if (props) Object.assign(node, props);
    (children || []).forEach((c) => node.append(c));
    return node;
  }
  function fmtDate(iso) {
    const d = new Date(iso);
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }
  function validate(name, message) {
    const n = (name || "").trim();
    const m = (message || "").trim();
    const errors = {};
    if (n.length < 1) errors.name = "이름을 입력해 주세요.";
    else if (n.length > 20) errors.name = "이름은 20자 이하로 입력해 주세요.";
    if (m.length < 1) errors.message = "메시지를 입력해 주세요.";
    else if (m.length > 200) errors.message = "메시지는 200자 이하로 입력해 주세요.";
    return { ok: Object.keys(errors).length === 0, errors, name: n, message: m };
  }

  // ---------- [기능 1] Projects ----------
  async function renderProjects() {
    const box = $("#project-list");
    try {
      const projects = await api.listProjects();
      projects.forEach((p) => {
        const btn = el("button", { textContent: "자세히 보기", type: "button" });
        btn.addEventListener("click", () => openDetail(p.projectId, btn));
        const tags = el("ul", { className: "tags" }, p.tags.map((t) => el("li", { textContent: t })));
        box.append(el("article", { className: "card" }, [
          el("h3", { textContent: p.title }),
          el("p", { textContent: p.summary }),
          tags,
          btn
        ]));
      });
    } catch {
      box.textContent = "프로젝트를 불러오지 못했습니다.";
    }
  }

  let lastTrigger = null;
  async function openDetail(projectId, trigger) {
    lastTrigger = trigger;
    const body = $("#modal-body");
    body.replaceChildren();
    $("#modal").hidden = false;
    document.body.style.overflow = "hidden";
    try {
      const p = await api.getProject(projectId);
      const row = (label, value) => el("p", { className: "detail-row" }, [el("b", { textContent: label }), " " + value]);
      const table = el("table", {}, [
        el("thead", {}, [el("tr", {}, ["테이블", "PK", "FK"].map((h) => el("th", { textContent: h })))]),
        el("tbody", {}, p.tables.map((t) => el("tr", {}, [t.name, t.pk, t.fk].map((v) => el("td", { textContent: v })))))
      ]);
      body.append(
        el("h3", { id: "modal-title", textContent: p.title }),
        row("기간", p.period),
        row("담당 역할", p.role),
        row("사용 기술", p.tech),
        el("h4", { textContent: "설계한 테이블과 PK·FK" }),
        table,
        el("h4", { textContent: "결과" }),
        el("p", { textContent: p.result }),
        el("h4", { textContent: "배운 점" }),
        el("p", { textContent: p.lesson })
      );
    } catch {
      body.append(el("p", { id: "modal-title", textContent: "잠시 후 다시 시도해 주세요" }));
    }
    $("#modal-close").focus();
  }
  function closeDetail() {
    if ($("#modal").hidden) return;
    $("#modal").hidden = true;
    document.body.style.overflow = "";
    if (lastTrigger) lastTrigger.focus({ preventScroll: true });
  }
  $("#modal-close").addEventListener("click", closeDetail);
  $("#modal").addEventListener("click", (e) => { if (e.target.id === "modal") closeDetail(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDetail(); });

  // ---------- [기능 2] Guestbook write ----------
  const form = $("#gb-form");
  const nameInput = $("#gb-name");
  const msgInput = $("#gb-message");
  const submitBtn = $("#gb-submit");
  let saving = false;

  function updateButton() {
    $("#gb-count").textContent = msgInput.value.trim().length;
    submitBtn.disabled = saving || !nameInput.value.trim() || !msgInput.value.trim();
  }
  nameInput.addEventListener("input", updateButton);
  msgInput.addEventListener("input", updateButton);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (saving) return;
    $("#gb-notice").textContent = "";
    const v = validate(nameInput.value, msgInput.value);
    $("#gb-name-error").textContent = v.errors.name || "";
    $("#gb-message-error").textContent = v.errors.message || "";
    if (!v.ok) return;

    saving = true; updateButton();
    try {
      const entry = await api.createEntry(v.name, v.message);
      nameInput.value = ""; msgInput.value = "";
      $("#gb-list").prepend(renderEntry(entry));
      $("#gb-empty").hidden = true;
      $("#gb-notice").textContent = "방명록이 등록되었습니다";
    } catch {
      $("#gb-notice").textContent = "";
      $("#gb-message-error").textContent = "저장하지 못했습니다. 잠시 후 다시 시도해 주세요.";
    } finally {
      saving = false; updateButton();
    }
  });

  // ---------- [기능 3] Guestbook list ----------
  let nextToken = null;
  function renderEntry(entry) {
    // textContent keeps HTML tags as plain text.
    const text = el("p", { className: "gb-text", textContent: entry.message, title: "눌러서 펼치기" });
    text.addEventListener("click", () => text.classList.toggle("expanded"));
    return el("li", { className: "gb-item" }, [
      el("div", { className: "gb-meta" }, [el("strong", { textContent: entry.name }), el("time", { textContent: fmtDate(entry.createdAt), dateTime: entry.createdAt })]),
      text
    ]);
  }
  async function loadEntries(append) {
    const res = await api.listEntries(PAGE_SIZE, append ? nextToken : null);
    const list = $("#gb-list");
    if (!append) list.replaceChildren();
    res.items.forEach((it) => list.append(renderEntry(it)));
    nextToken = res.nextToken;
    $("#gb-more").hidden = !nextToken;
    $("#gb-empty").hidden = list.children.length > 0;
  }
  $("#gb-more").addEventListener("click", () => loadEntries(true));

  renderProjects();
  loadEntries(false);
})();
