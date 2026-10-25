(() => {
  const taskList = document.querySelector("#task-list");
  const loadingState = document.querySelector("#loading-state");
  const emptyState = document.querySelector("#empty-state");
  const errorMessage = document.querySelector("#error-message");
  const dialog = document.querySelector("#task-dialog");
  const form = document.querySelector("#task-form");
  const searchInput = document.querySelector("#search-input");
  const formError = document.querySelector("#form-error");
  const saveButton = document.querySelector("#save-task-button");
  const filters = [...document.querySelectorAll(".filter-tab")];
  let tasks = [];
  let activeFilter = "all";
  let editingId = null;

  const escapeSvg = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3 8 3.2 3.2L13 4.8"></path></svg>';

  function setToday() {
    document.querySelector("#today-label").textContent = new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric"
    }).format(new Date());
  }

  function setError(message) {
    errorMessage.textContent = message;
    errorMessage.hidden = !message;
  }

  async function request(path, options = {}) {
    const response = await fetch(path, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers
      }
    });
    if (!response.ok) {
      let detail = "";
      try {
        detail = await response.text();
      } catch (error) {
        console.error("Could not read the server error response.", error);
      }
      throw new Error(detail || `Request failed (${response.status}).`);
    }
    if (response.status === 204) return null;
    return response.json();
  }

  function updateCounts() {
    const completed = tasks.filter(task => task.completed).length;
    document.querySelector("#total-count").textContent = tasks.length;
    document.querySelector("#active-count").textContent = tasks.length - completed;
    document.querySelector("#completed-count").textContent = completed;
    document.querySelector("#all-tab-count").textContent = tasks.length;
  }

  function makeAction(label, className, icon, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `icon-button ${className}`;
    button.setAttribute("aria-label", label);
    button.title = label;
    button.textContent = icon;
    button.addEventListener("click", onClick);
    return button;
  }

  function renderTasks() {
    taskList.replaceChildren();
    const query = searchInput.value.trim().toLocaleLowerCase();
    const visibleTasks = tasks.filter(task => {
      const matchesFilter = activeFilter === "all"
        || (activeFilter === "active" && !task.completed)
        || (activeFilter === "completed" && task.completed);
      const matchesSearch = `${task.title} ${task.description || ""}`.toLocaleLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });

    visibleTasks.forEach(task => {
      const row = document.createElement("article");
      row.className = `task-row${task.completed ? " is-completed" : ""}`;

      const checkbox = document.createElement("button");
      checkbox.type = "button";
      checkbox.className = `task-check${task.completed ? " checked" : ""}`;
      checkbox.setAttribute("aria-label", task.completed ? `Mark ${task.title} as in progress` : `Complete ${task.title}`);
      checkbox.setAttribute("aria-pressed", String(task.completed));
      if (task.completed) checkbox.innerHTML = escapeSvg;
      checkbox.addEventListener("click", () => toggleTask(task));

      const copy = document.createElement("div");
      copy.className = "task-copy";
      const title = document.createElement("h3");
      title.className = "task-title";
      title.textContent = task.title;
      copy.append(title);
      if (task.description) {
        const description = document.createElement("p");
        description.className = "task-description";
        description.textContent = task.description;
        copy.append(description);
      }

      const status = document.createElement("span");
      status.className = `task-status${task.completed ? " done" : ""}`;
      status.textContent = task.completed ? "Completed" : "In progress";

      const actions = document.createElement("div");
      actions.className = "task-actions";
      actions.append(
        makeAction("Edit task", "edit-button", "✎", () => openDialog(task)),
        makeAction("Delete task", "delete-button", "×", () => deleteTask(task))
      );
      row.append(checkbox, copy, status, actions);
      taskList.append(row);
    });

    updateCounts();
    loadingState.hidden = true;
    emptyState.hidden = visibleTasks.length !== 0;
    if (visibleTasks.length === 0) {
      const isSearch = query.length > 0;
      const isFiltered = activeFilter !== "all";
      document.querySelector("#empty-title").textContent = isSearch
        ? "No matching tasks."
        : isFiltered ? "Nothing here just yet." : "A fresh start.";
      document.querySelector("#empty-copy").textContent = isSearch
        ? "Try another search or clear your search."
        : isFiltered ? "There are no tasks in this view." : "Add your first task and make today count.";
      document.querySelector("#empty-add-button").hidden = isSearch || isFiltered;
    }
  }

  async function loadTasks() {
    loadingState.hidden = false;
    emptyState.hidden = true;
    setError("");
    try {
      tasks = await request("/api/tasks");
      if (!Array.isArray(tasks)) throw new Error("The server returned an unexpected task list.");
      renderTasks();
    } catch (error) {
      loadingState.hidden = true;
      setError(`Couldn't load your tasks. ${error.message} Check that the application is running, then refresh the page.`);
    }
  }

  function openDialog(task = null) {
    editingId = task?.id ?? null;
    form.reset();
    formError.hidden = true;
    formError.textContent = "";
    document.querySelector("#dialog-title").textContent = task ? "Edit task" : "Create a task";
    document.querySelector("#task-title").value = task?.title ?? "";
    document.querySelector("#task-description").value = task?.description ?? "";
    document.querySelector("#task-completed").checked = task?.completed ?? false;
    saveButton.innerHTML = task ? 'Save changes <span aria-hidden="true">→</span>' : 'Save task <span aria-hidden="true">→</span>';
    dialog.showModal();
    document.querySelector("#task-title").focus();
  }

  async function toggleTask(task) {
    setError("");
    try {
      const updated = await request(`/api/tasks/${task.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...task, completed: !task.completed })
      });
      tasks = tasks.map(item => item.id === updated.id ? updated : item);
      renderTasks();
    } catch (error) {
      setError(`Couldn't update "${task.title}". ${error.message}`);
    }
  }

  async function deleteTask(task) {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    setError("");
    try {
      await request(`/api/tasks/${task.id}`, { method: "DELETE" });
      tasks = tasks.filter(item => item.id !== task.id);
      renderTasks();
    } catch (error) {
      setError(`Couldn't delete "${task.title}". ${error.message}`);
    }
  }

  document.querySelector("#add-task-button").addEventListener("click", () => openDialog());
  document.querySelector("#empty-add-button").addEventListener("click", () => openDialog());
  document.querySelector("#close-dialog").addEventListener("click", () => dialog.close());
  document.querySelector("#cancel-dialog").addEventListener("click", () => dialog.close());
  searchInput.addEventListener("input", renderTasks);
  searchInput.addEventListener("keydown", event => {
    if (event.key === "Escape") searchInput.value = "";
    if (event.key === "Escape") renderTasks();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "/" && !dialog.open && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
      event.preventDefault();
      searchInput.focus();
    }
  });
  filters.forEach(button => button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filters.forEach(filter => {
      const selected = filter === button;
      filter.classList.toggle("selected", selected);
      filter.setAttribute("aria-selected", String(selected));
    });
    renderTasks();
  }));

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const title = document.querySelector("#task-title").value.trim();
    const description = document.querySelector("#task-description").value.trim();
    const completed = document.querySelector("#task-completed").checked;
    if (!title) {
      formError.textContent = "Please enter a task name.";
      formError.hidden = false;
      document.querySelector("#task-title").focus();
      return;
    }

    saveButton.disabled = true;
    saveButton.textContent = "Saving…";
    formError.hidden = true;
    const taskBody = { title, description, completed };
    try {
      const savedTask = editingId === null
        ? await request("/api/tasks", { method: "POST", body: JSON.stringify(taskBody) })
        : await request(`/api/tasks/${editingId}`, { method: "PUT", body: JSON.stringify(taskBody) });
      if (editingId === null) tasks = [savedTask, ...tasks];
      else tasks = tasks.map(task => task.id === savedTask.id ? savedTask : task);
      dialog.close();
      setError("");
      renderTasks();
    } catch (error) {
      formError.textContent = `Couldn't save the task. ${error.message}`;
      formError.hidden = false;
    } finally {
      saveButton.disabled = false;
      saveButton.innerHTML = editingId === null ? 'Save task <span aria-hidden="true">→</span>' : 'Save changes <span aria-hidden="true">→</span>';
    }
  });

  setToday();
  loadTasks();
})();
