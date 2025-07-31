function moveToSignup() {
  document.getElementById("signup-container").style.display = "block";
  document.getElementById("signin-container").style.display = "none";
  document.getElementById("todos-container").style.display = "none";
}

function moveToSignin() {
  document.getElementById("signup-container").style.display = "none";
  document.getElementById("signin-container").style.display = "block";
  document.getElementById("todos-container").style.display = "none";
}

function showTodoApp() {
  document.getElementById("signup-container").style.display = "none";
  document.getElementById("signin-container").style.display = "none";
  document.getElementById("todos-container").style.display = "block";
  getTodos();
}

async function signup() {
  const username = document.getElementById("signup-username").value;
  const password = document.getElementById("signup-password").value;

  try {
    const res = await axios.post("http://localhost:3000/signup", { username, password });
    alert(res.data.message);
    if (res.data.message.includes("signed up")) moveToSignin();
  } catch (err) {
    console.error("Signup error:", err);
  }
}

async function signin() {
  const username = document.getElementById("signin-username").value;
  const password = document.getElementById("signin-password").value;

  try {
    const res = await axios.post("http://localhost:3000/signin", { username, password });
    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
      alert(res.data.message);
      showTodoApp();
    } else {
      alert("Login failed");
    }
  } catch (err) {
    console.error("Signin error:", err);
  }
}

function logout() {
  localStorage.removeItem("token");
  alert("You are logged out.");
  moveToSignin();
}

async function getTodos() {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:3000/todos", {
      headers: { Authorization: token },
    });

    const todosList = document.getElementById("todos-list");
    todosList.innerHTML = "";

    res.data.forEach((todo) => {
      const todoElement = createTodoElement(todo);
      todosList.appendChild(todoElement);
    });
  } catch (err) {
    console.error("Error while getting To-Do list:", err);
  }
}

async function addTodo() {
  const input = document.getElementById("input");
  const title = input.value.trim();

  if (!title) {
    alert("Please enter a task.");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    await axios.post("http://localhost:3000/todos", { title }, {
      headers: { Authorization: token },
    });

    input.value = "";
    getTodos();
  } catch (err) {
    console.error("Error while adding a new To-Do item:", err);
  }
}

async function updateTodo(id, newTitle) {
  const token = localStorage.getItem("token");
  try {
    await axios.put(`http://localhost:3000/todos/${id}`, { title: newTitle }, {
      headers: { Authorization: token },
    });
    getTodos();
  } catch (err) {
    console.error("Update error:", err);
  }
}

async function deleteTodo(id) {
  const token = localStorage.getItem("token");
  try {
    await axios.delete(`http://localhost:3000/todos/${id}`, {
      headers: { Authorization: token },
    });
    getTodos();
  } catch (err) {
    console.error("Delete error:", err);
  }
}

async function toggleTodoDone(id, done) {
  const token = localStorage.getItem("token");
  try {
    await axios.put(`http://localhost:3000/todos/${id}/done`, { done }, {
      headers: { Authorization: token },
    });
    getTodos();
  } catch (err) {
    console.error("Toggle done error:", err);
  }
}

function createTodoElement(todo) {
  const div = document.createElement("div");
  div.className = "todo-item";

  const input = document.createElement("input");
  input.type = "text";
  input.value = todo.title;
  input.readOnly = true;
  input.style.textDecoration = todo.done ? "line-through" : "none";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.done;
  checkbox.onchange = () => {
    input.style.textDecoration = checkbox.checked ? "line-through" : "none";
    toggleTodoDone(todo.id, checkbox.checked);
  };

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.onclick = () => {
    if (input.readOnly) {
      input.readOnly = false;
      input.focus();
      editBtn.textContent = "Save";
    } else {
      input.readOnly = true;
      editBtn.textContent = "Edit";
      updateTodo(todo.id, input.value);
    }
  };

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.onclick = () => deleteTodo(todo.id);

  div.appendChild(input);
  div.appendChild(checkbox);
  div.appendChild(editBtn);
  div.appendChild(deleteBtn);

  return div;
}
