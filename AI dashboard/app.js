// Utilities
const storage = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
};

function todayKey() {
  const d = new Date();
  const m = `${d.getMonth()+1}`.padStart(2,'0');
  const day = `${d.getDate()}`.padStart(2,'0');
  return `${d.getFullYear()}-${m}-${day}`;
}

// Sidebar + Topbar
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const quickAdd = document.getElementById('quickAdd');

sidebarToggle.addEventListener('click', () => {
  if (window.innerWidth <= 800) {
    sidebar.classList.toggle('hidden');
    // Ensure it doesn't stay collapsed if it was collapsed on desktop
    sidebar.classList.remove('collapsed');
  } else {
    sidebar.classList.toggle('collapsed');
  }
});

// Auth Logic
const authPage = document.getElementById('authPage');
const mainApp = document.getElementById('mainApp');
const authForm = document.getElementById('authForm');
const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const authSubmit = document.getElementById('authSubmit');

tabLogin?.addEventListener('click', () => {
  tabLogin.classList.add('active');
  tabRegister.classList.remove('active');
  authSubmit.querySelector('span').textContent = 'Login to Dashboard';
});

tabRegister?.addEventListener('click', () => {
  tabRegister.classList.add('active');
  tabLogin.classList.remove('active');
  authSubmit.querySelector('span').textContent = 'Create Account';
});

authForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  authPage.classList.add('hidden');
  mainApp.classList.remove('hidden');
  document.body.classList.remove('auth-required');
  if (window.lucide) lucide.createIcons();
  // Trigger chart resize after reveal
  if (chart) chart.resize();
});

// Navigation & View Switching
const dashboardContent = document.getElementById('dashboardContent');
const settingsContent = document.getElementById('settingsContent');
const profileContent = document.getElementById('profileContent');
const navItems = document.querySelectorAll('.nav-item');

function showView(viewId) {
  [dashboardContent, settingsContent, profileContent].forEach(v => v?.classList.add('hidden'));
  document.getElementById(viewId)?.classList.remove('hidden');
  
  // Update active state in nav
  navItems.forEach(item => {
    item.classList.toggle('active', item.dataset.section === (viewId.replace('Content', '')));
  });
}

document.querySelector('[data-section="dashboard"]')?.addEventListener('click', (e) => {
  e.preventDefault();
  showView('dashboardContent');
});

document.getElementById('navSettings')?.addEventListener('click', (e) => {
  e.preventDefault();
  showView('settingsContent');
});

document.querySelectorAll('.back-to-dash').forEach(btn => {
  btn.addEventListener('click', () => showView('dashboardContent'));
});

// User Dropdown
const userAvatar = document.getElementById('userAvatar');
const userMenu = document.getElementById('userMenu');

userAvatar?.addEventListener('click', (e) => {
  e.stopPropagation();
  userMenu.classList.toggle('show');
});

document.addEventListener('click', () => userMenu?.classList.remove('show'));

document.getElementById('menuProfile')?.addEventListener('click', (e) => {
  e.preventDefault();
  showView('profileContent');
});

document.getElementById('menuSettings')?.addEventListener('click', (e) => {
  e.preventDefault();
  showView('settingsContent');
});

document.getElementById('btnLogout')?.addEventListener('click', (e) => {
  e.preventDefault();
  location.reload(); // Simple way to "logout" for this demo
});

// Icons
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
});

// Search
const globalSearch = document.getElementById('globalSearch');
globalSearch?.addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  document.querySelectorAll('.task-item').forEach(li => {
    const t = li.querySelector('.task-title')?.textContent?.toLowerCase() || '';
    li.style.display = t.includes(q) ? '' : 'none';
  });
});

// Tasks
const TASKS_KEY = 'ai_dash_tasks';
const STATS_KEY = 'ai_dash_stats';
const taskList = document.getElementById('taskList');
const addTaskBtn = document.getElementById('addTaskBtn');
const addTaskForm = document.getElementById('addTaskForm');
const newTaskTitle = document.getElementById('newTaskTitle');
const saveTaskBtn = document.getElementById('saveTaskBtn');
const cancelTaskBtn = document.getElementById('cancelTaskBtn');

function loadTasks() {
  return storage.get(TASKS_KEY, []);
}
function saveTasks(tasks) {
  storage.set(TASKS_KEY, tasks);
}
function renderTasks() {
  const tasks = loadTasks();
  taskList.innerHTML = '';
  if (!tasks.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'No tasks yet. Add one to get started.';
    taskList.appendChild(empty);
    return;
  }
  tasks.forEach((t, idx) => {
    const li = document.createElement('li');
    li.className = 'task-item';
    const left = document.createElement('div');
    left.className = 'task-left';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = !!t.done;
    const title = document.createElement('div');
    title.className = 'task-title' + (t.done ? ' done' : '');
    title.textContent = t.title;
    left.appendChild(checkbox);
    left.appendChild(title);
    const actions = document.createElement('div');
    actions.className = 'task-actions';
    const delBtn = document.createElement('button');
    delBtn.className = 'btn-secondary btn-sm';
    delBtn.innerHTML = '<i data-lucide="trash-2"></i><span>Delete</span>';
    actions.appendChild(delBtn);
    li.appendChild(left);
    li.appendChild(actions);
    taskList.appendChild(li);
    if (window.lucide) lucide.createIcons({root: li});

    checkbox.addEventListener('change', () => {
      const arr = loadTasks();
      arr[idx].done = checkbox.checked;
      saveTasks(arr);
      title.classList.toggle('done', checkbox.checked);
      updateTodayStats(checkbox.checked ? 1 : -1);
      updateGoalsProgress();
      updateChart();
    });
    delBtn.addEventListener('click', () => {
      const arr = loadTasks();
      const removed = arr.splice(idx, 1)[0];
      saveTasks(arr);
      if (removed?.done) updateTodayStats(-1);
      renderTasks();
      updateGoalsProgress();
      updateChart();
    });
  });
}

function updateTodayStats(delta) {
  const stats = storage.get(STATS_KEY, {});
  const k = todayKey();
  stats[k] = Math.max(0, (stats[k] ?? 0) + delta);
  storage.set(STATS_KEY, stats);
}

function showAddTask(show) {
  addTaskForm.classList.toggle('hidden', !show);
  if (show) newTaskTitle.focus();
}

addTaskBtn.addEventListener('click', () => showAddTask(true));
quickAdd?.addEventListener('click', () => showAddTask(true));
cancelTaskBtn.addEventListener('click', () => showAddTask(false));
saveTaskBtn.addEventListener('click', () => {
  const title = (newTaskTitle.value || '').trim();
  if (!title) return;
  const tasks = loadTasks();
  tasks.unshift({ title, done:false, createdAt:Date.now() });
  saveTasks(tasks);
  newTaskTitle.value = '';
  showAddTask(false);
  renderTasks();
});

// Notes
const NOTES_KEY = 'ai_dash_notes';
const notesInput = document.getElementById('notesInput');
const notesSaveIndicator = document.getElementById('notesSaveIndicator');
let notesTimer;
function loadNotes() {
  notesInput.value = storage.get(NOTES_KEY, '');
}
function saveNotesDebounced() {
  clearTimeout(notesTimer);
  notesSaveIndicator.textContent = 'Saving...';
  notesTimer = setTimeout(() => {
    storage.set(NOTES_KEY, notesInput.value);
    notesSaveIndicator.textContent = 'Saved';
  }, 500);
}
notesInput.addEventListener('input', saveNotesDebounced);

// Pomodoro
const POMO_KEY = 'ai_dash_pomodoro';
const timerDisplay = document.getElementById('timerDisplay');
const timerStart = document.getElementById('timerStart');
const timerPause = document.getElementById('timerPause');
const timerReset = document.getElementById('timerReset');
const timerMinutes = document.getElementById('timerMinutes');
const pomodoroStatus = document.getElementById('pomodoroStatus');

let timerInterval = null;
let remaining = (parseInt(timerMinutes.value,10) || 25) * 60;
let running = false;

function fmt(s) {
  const m = Math.floor(s/60); const sec = s%60;
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}
function renderTimer() {
  timerDisplay.textContent = fmt(remaining);
}
function startTimer() {
  if (running) return;
  running = true;
  pomodoroStatus.textContent = 'Running';
  timerInterval = setInterval(() => {
    remaining = Math.max(0, remaining - 1);
    renderTimer();
    if (remaining === 0) {
      clearInterval(timerInterval);
      running = false;
      pomodoroStatus.textContent = 'Completed';
      updateTodayStats(1);
      updateGoalsProgress();
      updateChart();
    }
  }, 1000);
}
function pauseTimer() {
  if (!running) return;
  running = false;
  clearInterval(timerInterval);
  pomodoroStatus.textContent = 'Paused';
}
function resetTimer() {
  running = false;
  clearInterval(timerInterval);
  remaining = (parseInt(timerMinutes.value,10) || 25) * 60;
  renderTimer();
  pomodoroStatus.textContent = 'Ready';
}
timerMinutes.addEventListener('change', () => {
  remaining = (parseInt(timerMinutes.value,10) || 25) * 60;
  renderTimer();
});
timerStart.addEventListener('click', startTimer);
timerPause.addEventListener('click', pauseTimer);
timerReset.addEventListener('click', resetTimer);

// Chart
const ctx = document.getElementById('productivityChart').getContext('2d');
let chart;
function last7Days() {
  const labels = [];
  const keys = [];
  for (let i=6;i>=0;i--) {
    const d = new Date(); d.setDate(d.getDate()-i);
    const m = `${d.getMonth()+1}`.padStart(2,'0');
    const day = `${d.getDate()}`.padStart(2,'0');
    keys.push(`${d.getFullYear()}-${m}-${day}`);
    labels.push(`${m}/${day}`);
  }
  return {labels, keys};
}
function buildChart() {
  const {labels, keys} = last7Days();
  const stats = storage.get(STATS_KEY, {});
  const data = keys.map(k => stats[k] ?? 0);
  const gradient = ctx.createLinearGradient(0,0,0,200);
  gradient.addColorStop(0,'rgba(124,58,237,0.9)');
  gradient.addColorStop(1,'rgba(6,182,212,0.9)');
  chart = new Chart(ctx, {
    type:'bar',
    data:{ labels, datasets:[{ label:'Completed', data, backgroundColor:gradient, borderRadius:8 }]},
    options:{
      responsive:true,
      plugins:{ legend:{ display:false }},
      scales:{
        y:{ beginAtZero:true, grid:{ color:'rgba(255,255,255,0.06)' }, ticks:{ color:'#cbd5e1' } },
        x:{ grid:{ display:false }, ticks:{ color:'#cbd5e1' } }
      }
    }
  });
}
function updateChart() {
  if (!chart) return;
  const {keys} = last7Days();
  const stats = storage.get(STATS_KEY, {});
  chart.data.datasets[0].data = keys.map(k => stats[k] ?? 0);
  chart.update();
}

// Goals
const GOAL_KEY = 'ai_dash_goal';
const dailyGoalInput = document.getElementById('dailyGoalInput');
const goalSummary = document.getElementById('goalSummary');
const goalsProgress = document.getElementById('goalsProgress');
function loadGoal() {
  const g = storage.get(GOAL_KEY, 5);
  dailyGoalInput.value = g;
}
function todayCompletedCount() {
  const stats = storage.get(STATS_KEY, {});
  return stats[todayKey()] ?? 0;
}
function updateGoalsProgress() {
  const goal = parseInt(dailyGoalInput.value,10) || 1;
  const count = todayCompletedCount();
  const pct = Math.max(0, Math.min(100, Math.round((count/goal)*100)));
  goalsProgress.style.width = pct + '%';
  goalSummary.textContent = `${count} / ${goal} tasks`;
}
dailyGoalInput.addEventListener('change', () => {
  const v = Math.max(1, parseInt(dailyGoalInput.value,10) || 1);
  storage.set(GOAL_KEY, v);
  dailyGoalInput.value = v;
  updateGoalsProgress();
});

// Focus mode toggle
document.getElementById('toggleFocus')?.addEventListener('click', () => {
  document.body.classList.toggle('focus-mode');
});

// Init
function init() {
  loadNotes();
  loadGoal();
  renderTasks();
  renderTimer();
  buildChart();
  updateGoalsProgress();
}
document.addEventListener('DOMContentLoaded', init);
