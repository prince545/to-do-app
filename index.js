const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();

app.use(express.json());
app.use(express.static("public"));

const users = [];
const todos = [];
let todoIdCounter = 1;
const JWT_SECRET = "ilove100xdevsliveclasses";

// Middleware
function logger(req, res, next) {
    console.log(`${req.method} request received`);
    next();
}

function auth(req, res, next) {
    const token = req.headers.authorization;
    if (!token) {
        return res.json({ message: "Token is missing!" });
    }

    try {
        const decodedData = jwt.verify(token, JWT_SECRET);
        req.username = decodedData.username;
        next();
    } catch {
        res.json({ message: "Invalid token!" });
    }
}

// Routes
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

app.post("/signup", logger, (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.json({ message: "Username and password are required." });
    if (username.length < 5) return res.json({ message: "Username must have at least 5 characters." });
    if (users.find(u => u.username === username)) return res.json({ message: "You are already signed up!" });

    users.push({ username, password });
    res.json({ message: "You have signed up successfully!" });
});

app.post("/signin", logger, (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.json({ message: "Username and password are required." });

    const foundUser = users.find(u => u.username === username && u.password === password);
    if (!foundUser) return res.json({ message: "Invalid username or password!" });

    const token = jwt.sign({ username }, JWT_SECRET);
    res.json({ token, message: "You are signed in successfully!" });
});

app.get("/me", logger, auth, (req, res) => {
    const user = users.find(u => u.username === req.username);
    if (user) res.json(user);
    else res.json({ message: "User not found!" });
});

// To-Do Routes
app.get("/todos", logger, auth, (req, res) => {
    const userTodos = todos.filter(t => t.username === req.username);
    res.json(userTodos);
});

app.post("/todos", logger, auth, (req, res) => {
    const { title } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required." });

    const newTodo = {
        id: todoIdCounter++,
        title,
        done: false,
        username: req.username,
    };

    todos.push(newTodo);
    res.status(201).json(newTodo);
});

app.put("/todos/:id", logger, auth, (req, res) => {
    const { id } = req.params;
    const { title } = req.body;

    const todo = todos.find(t => t.id == id && t.username === req.username);
    if (!todo) return res.status(404).json({ message: "Todo not found." });

    todo.title = title;
    res.json(todo);
});

app.put("/todos/:id/done", logger, auth, (req, res) => {
    const { id } = req.params;
    const { done } = req.body;

    const todo = todos.find(t => t.id == id && t.username === req.username);
    if (!todo) return res.status(404).json({ message: "Todo not found." });

    todo.done = done;
    res.json(todo);
});

app.delete("/todos/:id", logger, auth, (req, res) => {
    const { id } = req.params;

    const index = todos.findIndex(t => t.id == id && t.username === req.username);
    if (index === -1) return res.status(404).json({ message: "Todo not found." });

    todos.splice(index, 1);
    res.json({ message: "Todo deleted." });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
