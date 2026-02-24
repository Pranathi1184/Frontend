// State Management
let boardState = {
    columns: [
        { id: 'col-1', title: 'To Do', tasks: [] },
        { id: 'col-2', title: 'In Progress', tasks: [] },
        { id: 'col-3', title: 'Done', tasks: [] }
    ],
    nextTaskId: 1
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    renderBoard();
    initEventListeners();
    lucide.createIcons();
});

// Persistence
function saveState() {
    localStorage.setItem('nexusKanbanState', JSON.stringify(boardState));
}

function loadState() {
    const saved = localStorage.getItem('nexusKanbanState');
    if (saved) {
        boardState = JSON.parse(saved);
    }
}

// Rendering
function renderBoard() {
    const container = document.getElementById('columnContainer');
    container.innerHTML = '';
    
    let totalTasks = 0;
    
    boardState.columns.forEach(column => {
        totalTasks += column.tasks.length;
        const colEl = createColumnElement(column);
        container.appendChild(colEl);
    });
    
    document.getElementById('totalTasks').textContent = `${totalTasks} tasks`;
    lucide.createIcons();
}

function createColumnElement(column) {
    const col = document.createElement('div');
    col.className = 'column';
    col.id = column.id;
    col.dataset.id = column.id;
    
    col.innerHTML = `
        <div class="column-header">
            <div class="column-title-wrap">
                <h3 class="column-title">${column.title}</h3>
                <span class="column-count">${column.tasks.length}</span>
            </div>
            <div class="column-actions">
                <button class="icon-btn delete-col-btn" title="Delete Column"><i data-lucide="trash-2"></i></button>
            </div>
        </div>
        <div class="task-list" ondragover="handleDragOver(event)" ondrop="handleDrop(event)" ondragleave="handleDragLeave(event)">
            ${column.tasks.map(task => createTaskHTML(task)).join('')}
        </div>
    `;
    
    // Column Events
    col.querySelector('.delete-col-btn').onclick = () => deleteColumn(column.id);
    
    return col;
}

function createTaskHTML(task) {
    return `
        <div class="task-card" draggable="true" ondragstart="handleDragStart(event)" ondragend="handleDragEnd(event)" data-id="${task.id}" id="task-${task.id}">
            <span class="priority-tag priority-${task.priority}">${task.priority}</span>
            <h4 class="task-title">${task.title}</h4>
            <p class="task-desc">${task.desc || ''}</p>
            <div class="task-footer">
                <span class="task-label">${task.label}</span>
                <div class="task-actions">
                    <button class="icon-btn edit-task-btn" onclick="openEditModal('${task.id}')"><i data-lucide="edit-3"></i></button>
                    <button class="icon-btn delete-task-btn" onclick="deleteTask('${task.id}')"><i data-lucide="x"></i></button>
                </div>
            </div>
        </div>
    `;
}

// Task Operations
function openAddModal() {
    const modal = document.getElementById('taskModal');
    const form = document.getElementById('taskForm');
    document.getElementById('modalTitle').textContent = 'Add New Task';
    form.reset();
    document.getElementById('taskId').value = '';
    
    // Populate column select
    const colSelect = document.getElementById('taskColumn');
    colSelect.innerHTML = boardState.columns.map(col => 
        `<option value="${col.id}">${col.title}</option>`
    ).join('');
    
    modal.classList.add('active');
}

function openEditModal(taskId) {
    const task = findTaskById(taskId);
    if (!task) return;
    
    const modal = document.getElementById('taskModal');
    document.getElementById('modalTitle').textContent = 'Edit Task';
    document.getElementById('taskId').value = task.id;
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDesc').value = task.desc;
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskLabel').value = task.label;
    
    // Populate column select and set current
    const colSelect = document.getElementById('taskColumn');
    const currentCol = boardState.columns.find(c => c.tasks.some(t => t.id == taskId));
    colSelect.innerHTML = boardState.columns.map(col => 
        `<option value="${col.id}" ${col.id === currentCol.id ? 'selected' : ''}>${col.title}</option>`
    ).join('');
    
    modal.classList.add('active');
}

function findTaskById(id) {
    for (const col of boardState.columns) {
        const task = col.tasks.find(t => t.id == id);
        if (task) return task;
    }
    return null;
}

function handleTaskSubmit(e) {
    e.preventDefault();
    const taskId = document.getElementById('taskId').value;
    const title = document.getElementById('taskTitle').value;
    const desc = document.getElementById('taskDesc').value;
    const priority = document.getElementById('taskPriority').value;
    const label = document.getElementById('taskLabel').value;
    const targetColId = document.getElementById('taskColumn').value;
    
    if (taskId) {
        // Edit & potentially Move
        let task = findTaskById(taskId);
        task.title = title;
        task.desc = desc;
        task.priority = priority;
        task.label = label;
        
        // Check if column changed
        const currentCol = boardState.columns.find(c => c.tasks.some(t => t.id == taskId));
        if (currentCol.id !== targetColId) {
            moveTask(taskId, targetColId);
        }
    } else {
        // Add
        const newTask = {
            id: Date.now(),
            title,
            desc,
            priority,
            label
        };
        const targetCol = boardState.columns.find(c => c.id === targetColId);
        targetCol.tasks.push(newTask);
    }
    
    saveState();
    renderBoard();
    document.getElementById('taskModal').classList.remove('active');
}

function deleteTask(taskId) {
    boardState.columns.forEach(col => {
        col.tasks = col.tasks.filter(t => t.id != taskId);
    });
    saveState();
    renderBoard();
    
    // If we're in the tasks view, refresh that list too
    if (document.getElementById('tasksView').classList.contains('active')) {
        renderAllTasksList();
    }
}

// All Tasks View Rendering
function renderAllTasksList() {
    const tbody = document.getElementById('allTasksBody');
    tbody.innerHTML = '';
    
    boardState.columns.forEach(column => {
        column.tasks.forEach(task => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${task.title}</strong></td>
                <td><span class="task-label">${column.title}</span></td>
                <td><span class="priority-tag priority-${task.priority}">${task.priority}</span></td>
                <td><span class="task-label">${task.label}</span></td>
                <td>
                    <div class="task-actions-row">
                        <button class="icon-btn" onclick="openEditModal('${task.id}')"><i data-lucide="edit-3"></i></button>
                        <button class="icon-btn" onclick="deleteTask('${task.id}')"><i data-lucide="trash-2"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    });
    
    if (tbody.innerHTML === '') {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--muted); padding: 40px;">No tasks found. Create some on the Board!</td></tr>';
    }
    lucide.createIcons();
}

// Column Operations
function addColumn() {
    const title = prompt('Enter column name:');
    if (!title) return;
    
    boardState.columns.push({
        id: `col-${Date.now()}`,
        title,
        tasks: []
    });
    
    saveState();
    renderBoard();
}

function deleteColumn(colId) {
    if (!confirm('Delete this column and all its tasks?')) return;
    boardState.columns = boardState.columns.filter(c => c.id !== colId);
    saveState();
    renderBoard();
}

// Drag and Drop
let draggedTaskId = null;

function handleDragStart(e) {
    draggedTaskId = e.target.dataset.id;
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', draggedTaskId);
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    document.querySelectorAll('.task-list').forEach(l => l.classList.remove('drag-over'));
}

function handleDragOver(e) {
    e.preventDefault();
    const list = e.target.closest('.task-list');
    if (list) list.classList.add('drag-over');
}

function handleDragLeave(e) {
    const list = e.target.closest('.task-list');
    if (list) list.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    const list = e.target.closest('.task-list');
    const targetColId = list.closest('.column').dataset.id;
    const taskId = e.dataTransfer.getData('text/plain');
    
    moveTask(taskId, targetColId);
    list.classList.remove('drag-over');
}

function moveTask(taskId, targetColId) {
    let taskToMove = null;
    
    // Find and remove from old column
    boardState.columns.forEach(col => {
        const idx = col.tasks.findIndex(t => t.id == taskId);
        if (idx !== -1) {
            taskToMove = col.tasks.splice(idx, 1)[0];
        }
    });
    
    // Add to new column
    if (taskToMove) {
        const targetCol = boardState.columns.find(c => c.id === targetColId);
        targetCol.tasks.push(taskToMove);
    }
    
    saveState();
    renderBoard();
}

// Sidebar Toggle
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const icon = document.querySelector('#toggleSidebar i');
    sidebar.classList.toggle('collapsed');
    
    if (sidebar.classList.contains('collapsed')) {
        icon.setAttribute('data-lucide', 'chevron-right');
    } else {
        icon.setAttribute('data-lucide', 'chevron-left');
    }
    lucide.createIcons();
}

// Event Listeners
function initEventListeners() {
    document.getElementById('addTaskBtn').onclick = openAddModal;
    document.getElementById('addColumnBtn').onclick = addColumn;
    document.getElementById('toggleSidebar').onclick = toggleSidebar;
    document.getElementById('taskForm').onsubmit = handleTaskSubmit;
    
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.onclick = () => document.getElementById('taskModal').classList.remove('active');
    });

    // View Switching Logic
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view-container');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = item.getAttribute('data-view');
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Switch views
            views.forEach(view => {
                view.classList.remove('active');
                if (view.id === `${viewId}View`) {
                    view.classList.add('active');
                }
            });

            // Update board title based on view
            const boardTitle = document.getElementById('boardTitle');
            if (viewId === 'board') {
                boardTitle.textContent = 'Product Development';
                renderBoard(); // Re-render board to be safe
            } else if (viewId === 'tasks') {
                boardTitle.textContent = 'All Tasks';
                renderAllTasksList();
            } else {
                boardTitle.textContent = item.querySelector('span').textContent;
            }
        });
    });
    
    // Search
    document.getElementById('taskSearch').oninput = (e) => {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll('.task-card').forEach(card => {
            const title = card.querySelector('.task-title').textContent.toLowerCase();
            const desc = card.querySelector('.task-desc').textContent.toLowerCase();
            if (title.includes(query) || desc.includes(query)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    };
    
    // Keyboard Shortcut
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            openAddModal();
        }
    });
}
