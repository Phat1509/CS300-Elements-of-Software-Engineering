# Web Shoe Shop - Frontend Demo

## Overview

This project is the frontend of a web-based shoe shop application.
**Note:** The backend is not fully integrated yet. A mock API using `json-server` is provided to simulate some data for testing purposes.

At this stage, the frontend UI is functional, and the main flow of the Login/Logout use-case is demonstrated using mock data.

---

## Project Structure

```
/public
/src
  /components
  /pages
db.json
package.json
```

- **/src**: React components and pages.
- **db.json**: Mock data used by `json-server`.
- **package.json**: Contains scripts for running and building the project.

---

## Prerequisites

- Node.js (>=14)
- npm (>=6)

---

## Installation

1. Clone this repository:

```bash
git clone <your-repo-link>
cd <repo-folder>
```

2. Install dependencies:

```bash
npm install
```

---

## Running the Application

### 1. Start frontend

```bash
npm start
```

- The React frontend will start at `http://localhost:3000`.
- UI is interactive, main flow of login/logout is demonstrated with mock data.

### 2. Start mock API (optional)

```bash
npm run api
```

- This starts `json-server` at `http://localhost:5000`, serving data from `db.json`.
- Use this to simulate backend responses for testing frontend interactions.

---

## Main Features Demonstrated

- **Login / Logout** flow (using mock data)
- Navigation between pages
- UI layout for product listing, cart, etc.

---

## Notes

- Backend logic is not fully implemented yet.
- All interactions are currently using **mock data**.
- Once the backend is integrated, API endpoints in React can be updated to connect to the real server.

---

## Author / Team

- Team Name: [Your Team Name]
- Contributors: [Your Names]
