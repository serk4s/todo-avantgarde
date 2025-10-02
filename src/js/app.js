// src/js/app.js

// Глобальные переменные
let tasks = [];
const TASK_STORAGE_KEY = 'avantGardeToDoListTasks';
const THEME_STORAGE_KEY = 'avantGardeToDoListTheme';

// --- DOM Elements ---
const taskListEl = document.getElementById('task-list');
const modalEl = document.getElementById('task-modal');
const modalTitleEl = document.getElementById('modal-title');
const taskIdInput = document.getElementById('task-id');
const taskTextInput = document.getElementById('task-text');
const saveTaskBtn = document.getElementById('save-task-btn');
const addTaskBtn = document.getElementById('add-task-btn');
const cancelModalBtn = document.getElementById('cancel-modal-btn');
const taskForm = document.getElementById('task-form');
const themeToggleBtn = document.getElementById('theme-toggle');
const themeTextEl = document.querySelector('.theme-text');
const searchInput = document.getElementById('search-input');
const bodyEl = document.body;

// ----------------------------------------------------
// --- 1. Persistence ---
// ----------------------------------------------------

function loadTasks() {
    try {
        const storedTasks = localStorage.getItem(TASK_STORAGE_KEY);
        tasks = storedTasks ? JSON.parse(storedTasks) : [
            { id: Date.now() + 1, text: "Реализация: Модульная структура проекта", completed: false },
            { id: Date.now() + 2, text: "Стилизация: Тема низкого контраста с Tailwind и SCSS", completed: true },
        ];
        saveTasks();
    } catch (e) {
        console.error("Ошибка загрузки задач:", e);
        tasks = [];
    }
}

function saveTasks() {
    localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
}

// ----------------------------------------------------
// --- 2. Rendering ---
// ----------------------------------------------------

function createTaskHtml(task) {
    const completedClass = task.completed ? 'task-completed' : '';
    return `
        <li id="task-${task.id}" class="task-list-item ${completedClass} p-3 flex items-center justify-between transition-all duration-300">
            <div class="flex items-center flex-grow min-w-0">
                <input type="checkbox" data-id="${task.id}" ${task.completed ? 'checked' : ''}
                       class="custom-checkbox"
                       onchange="window.toggleTaskCompletion(${task.id})">
                <span class="task-text text-sm md:text-base truncate" title="${task.text}">${task.text}</span>
            </div>
            <div class="flex-shrink-0 space-x-2 ml-4">
                <button class="btn-icon p-1" onclick="window.openModalForEdit(${task.id})" title="Редактировать">
                    <i data-lucide="pencil" class="w-4 h-4 lucide-icon"></i>
                </button>
                <button class="btn-icon p-1" onclick="window.deleteTask(${task.id})" title="Удалить">
                    <i data-lucide="trash-2" class="w-4 h-4 lucide-icon"></i>
                </button>
            </div>
        </li>
    `;
}

function renderTasks(filterText = '') {
    const lowerCaseFilter = filterText.toLowerCase();
    const filteredTasks = tasks.filter(task =>
        task.text.toLowerCase().includes(lowerCaseFilter)
    );

    // Сортировка: невыполненные задачи идут первыми
    filteredTasks.sort((a, b) => {
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;
        return 0;
    });

    taskListEl.innerHTML = filteredTasks.map(createTaskHtml).join('');

    // Перезагрузка иконок для новых элементов
    // ! Важно: lucide.createIcons() вызывается в index.html после загрузки app.js,
    // но ее можно вызывать и здесь, чтобы обновить иконки после рендера списка
    if(window.lucide) {
        window.lucide.createIcons();
    }

    if (filteredTasks.length === 0) {
        taskListEl.innerHTML = `<li class="text-center p-4 text-sm text-opacity-50">
            ${filterText ? 'Задачи не найдены.' : 'Список задач пуст.'}
         </li>`;
    }
}

// ----------------------------------------------------
// --- 3. CRUD Operations ---
// ----------------------------------------------------

function handleFormSubmit(e) {
    e.preventDefault();
    const id = taskIdInput.value;
    const text = taskTextInput.value.trim();

    if (!text) return;

    if (id) {
        const taskIndex = tasks.findIndex(t => t.id === parseInt(id));
        if (taskIndex !== -1) {
            tasks[taskIndex].text = text;
        }
    } else {
        const newTask = {
            id: Date.now(),
            text: text,
            completed: false
        };
        tasks.push(newTask);
    }

    saveTasks();
    renderTasks(searchInput.value);
    closeModal();
}

function deleteTask(id) {
    const taskText = tasks.find(t => t.id === id)?.text || 'задачу';
    if (confirm(`Удалить: "${taskText}"?`)) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks(searchInput.value);
    }
}

function toggleTaskCompletion(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks(searchInput.value);
    }
}

// ----------------------------------------------------
// --- 4. Modal Logic ---
// ----------------------------------------------------

function openModalForCreate() {
    modalTitleEl.textContent = 'Создать Задачу';
    taskIdInput.value = '';
    taskTextInput.value = '';
    saveTaskBtn.textContent = 'Добавить';
    modalEl.classList.remove('hidden');
    modalEl.classList.add('flex');
    taskTextInput.focus();
}

function openModalForEdit(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        modalTitleEl.textContent = 'Редактировать Задачу';
        taskIdInput.value = task.id;
        taskTextInput.value = task.text;
        saveTaskBtn.textContent = 'Сохранить';
        modalEl.classList.remove('hidden');
        modalEl.classList.add('flex');
        taskTextInput.focus();
    }
}

function closeModal() {
    modalEl.classList.add('hidden');
    modalEl.classList.remove('flex');
    taskForm.reset();
}

// ----------------------------------------------------
// --- 5. Theme and Search ---
// ----------------------------------------------------

function toggleTheme() {
    const currentTheme = bodyEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    bodyEl.setAttribute('data-theme', currentTheme);
    themeTextEl.textContent = currentTheme === 'dark' ? 'Светлая Тема' : 'Тёмная Тема';
    localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
}

function loadTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
    bodyEl.setAttribute('data-theme', savedTheme);
    themeTextEl.textContent = savedTheme === 'dark' ? 'Светлая Тема' : 'Тёмная Тема';
}

function handleSearch() {
    renderTasks(searchInput.value);
}


// ----------------------------------------------------
// --- 6. Initialization ---
// ----------------------------------------------------

function initApp() {
    // 1. Загрузка данных и темы
    loadTheme();
    loadTasks();

    // 2. Первичный рендеринг
    renderTasks();

    // 3. Настройка слушателей событий
    addTaskBtn.addEventListener('click', openModalForCreate);
    cancelModalBtn.addEventListener('click', closeModal);
    taskForm.addEventListener('submit', handleFormSubmit);
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Закрытие модалки по клику вне контента
    modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalEl.classList.contains('flex')) {
            closeModal();
        }
    });

    // Делаем ключевые функции доступными глобально для HTML-атрибутов (onchange, onclick)
    window.deleteTask = deleteTask;
    window.toggleTaskCompletion = toggleTaskCompletion;
    window.openModalForEdit = openModalForEdit;
    window.handleSearch = handleSearch;
}

// Экспортируем initApp, чтобы вызвать ее из index.html
window.initApp = initApp;