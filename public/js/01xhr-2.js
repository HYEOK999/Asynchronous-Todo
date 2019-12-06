const $todos = document.querySelector('.todos');
const $inputTodo = document.querySelector('.input-todo');
const $clearCompleted = document.querySelector('.clear-completed > .btn');
const $completeAll = document.querySelector('.complete-all');
const $nav = document.querySelector('.nav');
const $completedTodos = document.querySelector('.completed-todos');
const $activeTodos = document.querySelector('.active-todos');

let todos = [];
let navID = 'all';

// TODOS 데이터 요청 및 받아오기.
const ajax = (() => {
  const request = (method, url, fn, payload) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(JSON.stringify(payload));

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

  return {
    get(url, fn) {
      request('GET', url, fn);
    },
    post(url, fn, payload) {
      request('POST', url, fn, payload);
    },
    delete(url, fn) {
      request('DELETE', url, fn);
    },
    patch(url, fn, payload) {
      request('PATCH', url, fn, payload);
    },
    put(url, fn, payload) {
      request('PUT', url, fn, payload);
    }
  };
})();

// render 함수
const render = (data) => {
  let html = '';
  todos = data;

  todos = data.filter((todo) => (navID === 'all' ? true : navID === 'active' ? !todo.completed : todo.completed));

  todos.forEach(({ id, content, completed }) => {
    html += `
    <li id="${id}" class="todo-item">
      <input class="checkbox" type="checkbox" id="ck-${id}" ${completed ? 'checked' : ''}>
      <label for="ck-${id}">${content}</label>
      <i class="remove-todo far fa-times-circle"></i>
    </li>`;
  });

  $completedTodos.textContent = data.filter((todo) => todo.completed).length;
  $activeTodos.textContent = data.filter((todo) => !todo.completed).length;
  $todos.innerHTML = html;
  console.log('[RENDER]', todos);
};

// 부가 기능 함수
const findMaxId = () => Math.max(0, ...todos.map((todo) => todo.id)) + 1;

// 기능 함수
const getTodos = () => {
  ajax.get('./todos', render);
};

const postTodos = (content) => {
  ajax.post('./todos', render, { id: findMaxId(), content, completed: false });
  $inputTodo.value = '';
};

const removeTodo = (id) => {
  ajax.delete(`./todos/${id}`, render);
};

// patch
const checkTodo = (id, checked) => {
  const completed = checked;
  // const completed = !todos.find((todo) => todo.id === +id).completed;
  ajax.patch(`./todos/${id}`, render, { completed });
};

const toggleAll = (checked) => {
  const completed = checked;
  ajax.patch('./todos', render, { completed });
};

const clearTodos = () => {
  ajax.delete('./completedTodos', render);
};

const changeNav = (target) => {
  [...$nav.children].forEach(($list) => {
    $list.classList.toggle('active', $list == target);
    navID = target.id;
  });
  ajax.get('./todos', render);
};

// 이벤트 핸들러
window.onload = () => {
  getTodos();
};

$inputTodo.onkeyup = ({ target, keyCode }) => {
  if (target.value.trim() === '' || keyCode !== 13) return;
  postTodos(target.value.trim());
};

$todos.onclick = ({ target }) => {
  if (!target.classList.contains('remove-todo')) return;
  removeTodo(target.parentNode.id);
};

$todos.onchange = ({ target }) => {
  checkTodo(target.parentNode.id, target.checked);
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
