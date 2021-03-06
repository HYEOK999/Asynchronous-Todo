let todos = [];
let navId = 'all';

const $todos = document.querySelector('.todos');
const $inputTodo = document.querySelector('.input-todo');
const $nav = document.querySelector('.nav');
const $clearCompleted = document.querySelector('.clear-completed > .btn');
const $completeAll = document.querySelector('.complete-all');
const $completedTodos = document.querySelector('.completed-todos');
const $activeTodos = document.querySelector('.active-todos');

// 렌더
const render = () => {
  let html = '';

  const _todos = todos.filter((todo) => (navId === 'all' ? true : navId === 'active' ? !todo.completed : todo.completed));
  _todos.forEach(({ id, content, completed }) => {
    html += `
    <li id="${id}" class="todo-item">
      <input class="checkbox" type="checkbox" id="ck-${id}" ${completed ? 'checked' : ''}>
      <label for="ck-${id}">${content}</label>
      <button class="remove-todo">X</button>
    </li>`;
  });

  $completedTodos.textContent = todos.filter((todo) => todo.completed).length;
  $activeTodos.textContent = todos.filter((todo) => !todo.completed).length;
  $todos.innerHTML = html;
};

// 기능
const findMaxId = () => Math.max(0, ...todos.map((todo) => todo.id)) + 1;

// 이벤트 함수
const getTodos = () => {
  fetch('/todos')
    .then((res) => res.json())
    .then((_todos) => todos = _todos)
    .then(render)
    .catch((err) => console.log(err));
};

const addTodos = () => {
  const todo = { id: findMaxId(), content: $inputTodo.value, completed: false };

  fetch('/todos', {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify(todo)
  })
    .then((res) => res.json())
    .then((_todos) => todos = _todos)
    .then(render)
    .catch((err) => console.log(err));
  $inputTodo.value = '';
};

const removeTodo = (id) => {
  fetch(`/todos/${id}`, {
    method: 'DELETE'
  })
    .then((res) => res.json())
    .then((_todos) => todos = _todos)
    .then(render)
    .catch((err) => console.log(err));
};

const toggleTodo = (id) => {
  const completed = !todos.find((todo) => todo.id === +id).completed;
  fetch(`/todos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify({ completed })
  })
    .then((res) => res.json())
    .then((_todos) => todos = _todos)
    .then(render)
    .catch((err) => console.log(err));
};

const toggleAll = (completed) => {
  fetch('./todos', {
    method: 'PATCH',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify({ completed })
  })
    .then((res) => res.json())
    .then((_todos) => todos = _todos)
    .then(render)
    .catch((err) => console.error(err));
};

const clearTodos = () => {
  fetch('./completedTodos', {
    method: 'DELETE'
  })
    .then((res) => res.json())
    .then((_todos) => todos = _todos)
    .then(render)
    .catch((err) => console.error(err));
};

const changeNav = (li) => {
  [...$nav.children].forEach(($list) => {
    $list.classList.toggle('active', $list === li);
  });
  navId = li.id;
  render();
};


// 이벤트
window.onload = () => {
  getTodos();
  console.log('fetch');
};

$inputTodo.onkeyup = ({ target, keyCode }) => {
  if (keyCode !== 13 || target.value.trim() === '') return;
  addTodos();
};

$todos.onclick = ({ target }) => {
  if (!target.classList.contains('remove-todo')) return;
  removeTodo(target.parentNode.id);
};

$todos.onchange = ({ target }) => {
  toggleTodo(target.parentNode.id);
};

$completeAll.onchange = ({ target }) => {
  toggleAll(target.checked);
};

$clearCompleted.onclick = () => {
  clearTodos();
};

$nav.onclick = ({ target }) => {
  if (target.classList.contains('nav')) return;
  changeNav(target);
};
