import '../assets/css/style.css';

const app = document.getElementById('app');

app.innerHTML = `
  <div class="todos">
    <div class="todos-header">
      <h3 class="todos-title">Todo List</h3>
      <div>
        <p>You have <span class="todos-count"></span> items</p>
        <button type="button" class="todos-clear" style="display: none;">
          Clear Completed
        </button>
      </div>
    </div>
    <form class="todos-form" name="todos">
      <input type="text" placeholder="What's next?" name="todo">
    </form>
    <ul class="todos-list"></ul>
  </div>
`;

// state
let todos = JSON.parse(localStorage.getItem('todos')) || [];

// selectors
const root = document.querySelector('.todos');
const list = root.querySelector('.todos-list');
const count = root.querySelector('.todos-count');
const clear = root.querySelector('.todos-clear');
const form = document.forms.todos;
const input = form.elements.todo;

// functions
function saveToStorage(todos) {
  localStorage.setItem('todos', JSON.stringify(todos));
}

function renderTodos(todos) {
  let todoString = '';
  todos.forEach((todo, index) => {
    todoString += `
      <li data-id="${index}" ${todo.complete ? ' class="todos-complete"' : ''}>
        <input type="checkbox" ${todo.complete ? ' checked' : ''}>
        <span>${todo.label}</span>
        <button type="button"></button>
      </li>
    `;
  });
  list.innerHTML = todoString;
  count.innerText = todos.filter(todo => !todo.complete).length;
  clear.style.display = todos.filter(todo => todo.complete).length ? 'block' : 'none';
}

function addTodo(event) {
  event.preventDefault();
  const label = input.value.trim();
  const complete = false;
  todos = [
    ...todos,
    {
      label,
      complete
    }
  ];
  renderTodos(todos);
  saveToStorage(todos);
  input.value = '';
}

function updateTodo(event) {
  const id = parseInt(event.target.parentNode.getAttribute('data-id'), 10);
  const complete = event.target.checked;
  todos = todos.map((todo, index) => {
    if (index === id) {
      return {
        ...todo,
        complete
      };
    }
    return todo;
  });
  renderTodos(todos);
  saveToStorage(todos);
}

function editTodo(event) {
  if (event.target.nodeName.toLowerCase() !== 'span') return;
  const id = parseInt(event.target.parentNode.getAttribute('data-id'), 10);
  const todoLabel = todos[id].label;

  const input = document.createElement('input');
  input.type = 'text';
  input.value = todoLabel;

  const list = event.target.parentNode;
  list.append(input);

  function handleEdit(event) {
    event.stopPropagation();
    const label = this.value;
    if (label !== todoLabel) {
      todos = todos.map((todo, index) => {
        if (index === id) {
          return {
            ...todo,
            label
          }
        }
        return todo;
      })
      renderTodos(todos);
      saveToStorage(todos);
    }
    // clean up
    /* technically we don't need to do this because it will be re-rendered,
    but it's a good practice to prevent any memory leaks */
    event.target.style.display = '';
    this.removeEventListener('change', handleEdit);
    /* It doesn't exist in the DOM, but to be sure that it 100% has been removed
    from memory and no other change events are indeed firing */
    this.remove();
  }

  /* DOM is still making these operations so to get our focus we need to add it
  as the last item */
  const span = event.target;
  span.style.display = 'none';
  input.addEventListener('change', handleEdit)
  input.focus();
}

function deleteTodo(event) {
  if (event.target.nodeName.toLowerCase() !== 'button') return;

  const id = parseInt(event.target.parentNode.getAttribute('data-id'), 10);
  const label = event.target.previousElementSibling.innerText;

  if (window.confirm(`Delete ${label}?`)) {
    todos = todos.filter((todo, index) => index !== id);
    renderTodos(todos);
    saveToStorage(todos);
  }
}

function clearCompleteTodos() {
  const count = todos.filter(todo => todo.complete).length;
  if (count === 0) return;
  if (window.confirm(`Delete ${count} todos?`)) {
    todos = todos.filter((todo) => !todo.complete);
    renderTodos(todos);
    saveToStorage(todos);
  }
}

function init() {
  renderTodos(todos);
  // Add
  form.addEventListener('submit', addTodo);
  // Update
  list.addEventListener('change', updateTodo);
  // Edit
  list.addEventListener('dblclick', editTodo);
  // Delete
  list.addEventListener('click', deleteTodo);
  // Complete All
  clear.addEventListener('click', clearCompleteTodos);
  // Save
  list.addEventListener('storage', saveToStorage);
}

init();
