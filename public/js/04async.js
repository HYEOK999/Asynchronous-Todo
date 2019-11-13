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
const getTodos = async () => {
  try {
    const res = await axios.get('/todos');
    todos = res.data;
    render();
  } catch (error) {
    console.error(error);
  }
};

const addTodos = async () => {
  try {
    const todo = { id: findMaxId(), content: $inputTodo.value, completed: false };
    const res = await axios.post('/todos', todo);
    todos = res.data;
    render();
  } catch (error) {
    console.error(error);
  }
  $inputTodo.value = '';
};

const removeTodo = async (id) => {
  try {
    const res = await axios.delete(`/todos/${id}`);
    todos = res.data;
    render();
  } catch (error) {
    console.log(error);
  }
};

const toggleTodo = async (id) => {
  try {
    const completed = !todos.find((todo) => todo.id === +id).completed;
    const res = await axios.patch(`/todos/${id}`, { completed });
    todos = res.data;
    render();
  } catch (error) {
    console.log(error);
  }
};

const toggleAll = async (completed) => {
  try {
    const res = await axios.patch('./todos', { completed });
    todos = res.data;
    render();
  } catch (error) {
    console.error(error);
  }
};

const clearTodos = async () => {
  try {
    const res = await axios.delete('./completedTodos');
    todos = res.data;
    render();
  } catch (error) {
    console.error(error);
  }
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
  console.log('async');
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
