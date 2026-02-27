# File System Recovery Demo

This workspace contains a simple web application that simulates file system CRUD operations with a backend server.

## Features

- **Login page** with attractive Bootstrap styling
- **Dashboard**: create/edit/delete files, recycle bin, storage usage
- **Backend**: Node.js + Express API with session authentication
- **Persistence**: data saved to `data/storage.json`

## Getting Started

1. Make sure you have [Node.js](https://nodejs.org/) installed.
2. Open a terminal and change to the project directory:
   ```powershell
   cd "c:\Users\jagad\Downloads\file syatems"
   ```
3. Install dependencies:
   ```powershell
   npm install
   ```
4. Start the server:
   ```powershell
   npm start
   ```
5. Open your browser and navigate to [http://localhost:3000](http://localhost:3000).
6. Use the **Register** link to create a new account (or use the default `admin` / `password` if you want to login immediately).

## Project Structure

```
file syatems/
├── data/                  # persisted JSON storage
├── public/                # frontend assets
│   ├── css/style.css
│   ├── js/script.js
│   └── index.html
├── server.js              # Express backend
├── package.json
├── .gitignore
└── README.md
```

## Extending

- Replace the static login with a real user database
- Hook filesystem operations to actual disk paths
- Add user management, file uploads, filtering, etc.
- Use the search box to filter files by name
- View or download a file directly from the dashboard
- After login only a single Create button is visible; file actions are hidden under a down‑arrow per row
- Click the arrow to reveal Edit, Delete, View, Download options for that file
- Deleted items go to the recycle bin, which you can open via the Bin button; items in the bin can be restored or permanently deleted
- Background has been softened to a subtle grey gradient with a light texture so controls are not overwhelmed
- All buttons are now dark, thick, and highly visible
- Help modal with tips and information
- Toast notifications appear after each operation
- Loading spinner displayed during network operations

Enjoy building a more realistic recovery tool!