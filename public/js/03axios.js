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
  axios.get('/todos')
    .then((res) => todos = res.data)
    .then(render)
    .catch((err) => console.log(err));
};

const addTodos = () => {
  const todo = { id: findMaxId(), content: $inputTodo.value, completed: false };
  axios.post('/todos', todo)
    .then((res) => todos = res.data)
    .then(render)
    .catch((err) => console.log(err));
  $inputTodo.value = '';
};

const removeTodo = (id) => {
  axios.delete(`/todos/${id}`)
    .then((res) => todos = res.data)
    .then(render)
    .catch((err) => console.log(err));
};

const toggleTodo = (id) => {
  const completed = !todos.find((todo) => todo.id === +id).completed;
  axios.patch(`/todos/${id}`, { completed })
    .then((res) => todos = res.data)
    .then(render)
    .catch((err) => console.log(err));
};

const toggleAll = (completed) => {
  axios.patch('./todos', { completed })
    .then((res) => todos = res.data)
    .then(render)
    .catch((err) => console.error(err));
};

const clearTodos = () => {
  axios.delete('./completedTodos')
    .then((res) => todos = res.data)
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
  console.log('axios');
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
