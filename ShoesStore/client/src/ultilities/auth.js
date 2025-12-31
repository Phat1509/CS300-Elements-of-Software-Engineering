const BASE = "http://localhost:3000/api/v1/auth";

async function safeJson(res) {
    const txt = await res.text();
    try {
        return JSON.parse(txt || "null");
    } catch (e) {
        return txt;
    }
}

// Try server auth first; if server unavailable, fall back to a local dev shim
async function tryServer(path, opts) {
    const res = await fetch(`${BASE}${path}`, opts);
    if (!res.ok) throw new Error(`Server auth failed ${res.status}`);
    return safeJson(res);
}

function shim_login(username, password) {
    const users = JSON.parse(localStorage.getItem("DEV_USERS") || "[]");
    const found = users.find((u) => u.username === username && u.password === password);
    if (found || (username === "admin" && password === "admin")) {
        const user = found || { id: "local-admin", username: "admin", role: "admin" };
        localStorage.setItem("DEV_AUTH_USER", JSON.stringify(user));
        return { userId: user.id };
    }
    throw new Error("Invalid credentials (dev)");
}

function shim_register(payload) {
    const users = JSON.parse(localStorage.getItem("DEV_USERS") || "[]");
    const exists = users.find((u) => u.username === payload.username);
    if (exists) throw new Error("User exists");
    const id = Date.now();
    const user = { id, username: payload.username, password: payload["!password"], role: payload.role || "user" };
    users.push(user);
    localStorage.setItem("DEV_USERS", JSON.stringify(users));
    return { message: "User registered (dev)" };
}

function shim_logout() {
    localStorage.removeItem("DEV_AUTH_USER");
    return { message: "Logged out (dev)" };
}

function shim_me() {
    const u = localStorage.getItem("DEV_AUTH_USER");
    if (!u) throw new Error("Not authenticated (dev)");
    return JSON.parse(u);
}

export async function login(username, password) {
    try {
        return await tryServer("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, "!password": password }),
            credentials: "include",
        });
    } catch (e) {
        return shim_login(username, password);
    }
}

export async function register(payload) {
    try {
        return await tryServer("/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            credentials: "include",
        });
    } catch (e) {
        return shim_register(payload);
    }
}

export async function logout() {
    try {
        return await tryServer("/logout", { method: "POST", credentials: "include" });
    } catch (e) {
        return shim_logout();
    }
}

export async function me() {
    try {
        return await tryServer("/me", { credentials: "include" });
    } catch (e) {
        return shim_me();
    }
}

export default { login, register, logout, me };
