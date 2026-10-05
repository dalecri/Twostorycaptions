// Outreach checklist (Tasks tab).

function addTask() {
  const input = document.getElementById('taskInput');
  const text = input.value.trim();
  if (!text) return;
  const brandId = document.getElementById('taskBrandSelect').value;
  const newTask = { id: uidTask(), text, done: false, brandId: brandId || '' };
  tasks.push(newTask);
  input.value = '';
  saveTasks(newTask.id);
  renderTasks();
  renderBrandBoard();
}

function toggleTask(id) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  t.done = !t.done;
  saveTasks(id);
  renderTasks();
  renderBrandBoard();
}

function deleteTask(id) {
  removeWithUndo(tasks, [id], 'Task deleted', saveTasks, () => { renderTasks(); renderBrandBoard(); });
}

function renderTasks() {
  const progressEl = document.getElementById('taskProgress');
  const listEl = document.getElementById('taskList');
  if (!progressEl || !listEl) return;

  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  progressEl.innerHTML = `${done} / ${total} complete<div class="task-progress-bar"><div class="task-progress-fill" style="width:${pct}%;"></div></div>`;

  listEl.innerHTML = '';
  if (!tasks.length) {
    listEl.innerHTML = '<div class="ot-empty">No tasks yet — add one above</div>';
    return;
  }

  const general = tasks.filter(t => !t.brandId);
  const byBrand = {};
  tasks.forEach(t => {
    if (t.brandId) {
      if (!byBrand[t.brandId]) byBrand[t.brandId] = [];
      byBrand[t.brandId].push(t);
    }
  });

  const renderGroup = (title, items) => {
    if (!items.length) return;
    const groupTitle = document.createElement('div');
    groupTitle.className = 'task-group-title';
    groupTitle.textContent = title;
    listEl.appendChild(groupTitle);
    items.forEach(t => listEl.appendChild(buildTaskRow(t)));
  };

  renderGroup('General', general);
  Object.keys(byBrand).forEach(brandId => {
    const b = brands.find(x => x.id === brandId);
    renderGroup(b ? b.name : 'Unknown brand', byBrand[brandId]);
  });
}

function buildTaskRow(t) {
  const row = document.createElement('div');
  row.className = 'task-row' + (t.done ? ' done' : '');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-checkbox';
  checkbox.checked = t.done;
  checkbox.onchange = () => toggleTask(t.id);
  const text = document.createElement('div');
  text.className = 'task-text';
  text.textContent = t.text;
  const delBtn = document.createElement('button');
  delBtn.className = 'task-del-btn';
  delBtn.innerHTML = NAV_ICONS.trash;
  delBtn.title = 'Delete task';
  delBtn.onclick = () => deleteTask(t.id);
  row.appendChild(checkbox);
  row.appendChild(text);
  row.appendChild(delBtn);
  return row;
}
