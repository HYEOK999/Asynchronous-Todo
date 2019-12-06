let navId = 'all';
let todos = [];
const $todos = document.querySelector('.todos');
const $inputTodo = document.querySelector('.input-todo');
const $nav = document.querySelector('.nav');
const $clearCompleted = document.querySelector('.clear-completed > .btn');
const $completeAll = document.querySelector('.complete-all');
const $completedTodos = document.querySelector('.completed-todos');
const $activeTodos = document.querySelector('.active-todos');

// 렌더
const render = (data) => {
  let html = '';
  todos = data;
  console.log(todos);
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


const get = (url, fn) => {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.send();
  xhr.onreadystatechange = () => {
    if (xhr.readyState !== XMLHttpRequest.DONE) return;
    // 200 정상 응답, POST는 가끔 201로 반환함.
    if (xhr.status === 200 || xhr.status === 201) {
      // todos = JSON.parse(xhr.response);
      fn(JSON.parse(xhr.response)); // 요청의 응답 된 데이터 처리
    } else {
      console.error('error', xhr.status, xhr.statusText);
    }
  };
};

const post = (url, fn, payload) => {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', url);
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.send(JSON.stringify(payload));

  console.log('data1', payload);

  xhr.onreadystatechange = () => {
    if (xhr.readyState !== XMLHttpRequest.DONE) return;
    // 200 정상 응답, POST는 가끔 201로 반환함.
    if (xhr.status === 200 || xhr.status === 201) {
      console.log('data2', JSON.parse(xhr.response));
      fn(JSON.parse(xhr.response)); // 요청의 응답 된 데이터 처리
    } else {
      console.error('error', xhr.status, xhr.statusText);
    }
  };
};

const del = (url, fn) => {
  const xhr = new XMLHttpRequest();
  xhr.open('DELETE', url);
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.send();
  xhr.onreadystatechange = () => {
    if (xhr.readyState !== XMLHttpRequest.DONE) return;
    // 200 정상 응답, POST는 가끔 201로 반환함.
    if (xhr.status === 200 || xhr.status === 201) {
      fn(JSON.parse(xhr.response)); // 요청의 응답 된 데이터 처리
    } else {
      console.error('error', xhr.status, xhr.statusText);
    }
  };
};

const patch = (url, fn, payload) => {
  const xhr = new XMLHttpRequest();
  xhr.open('PATCH', url);
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.send(JSON.stringify(payload));

  xhr.onreadystatechange = () => {
    if (xhr.readyState !== XMLHttpRequest.DONE) return;
    // 200 정상 응답, POST는 가끔 201로 반환함.
    if (xhr.status === 200 || xhr.status === 201) {
      todos = JSON.parse(xhr.response);
      fn(JSON.parse(xhr.response)); // 요청의 응답 된 데이터 처리
    } else {
      console.error('error', xhr.status, xhr.statusText);
    }
  };
};


// 기능
const findMaxId = () => Math.max(0, ...todos.map((todo) => todo.id)) + 1;

// 이벤트 함수
const getTodos = () => {
  get('./todos', render);
};

const addTodos = () => {
  post('./todos', render, { id: findMaxId(), content: $inputTodo.value, completed: false });
  $inputTodo.value = '';
};

const removeTodo = (id) => {
  del(`./todos/${id}`, render);
};

const toggleTodo = (id) => {
  console.log('todos=', todos);
  const completed = !todos.find((todo) => todo.id === +id).completed;
  patch(`/todos/${id}`, render, { completed });
};

const toggleAll = (completed) => {
  patch('./todos', render, { completed });
};

const clearTodos = () => {
  del('./completedTodos', render);
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
