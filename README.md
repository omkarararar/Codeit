# Codeit

Codeit is a simple real-time code collaboration app that lets multiple people edit code together inside a shared room. You enter a room ID, set a username, and start typing. Everyone in the same room sees updates instantly. The goal is to keep the experience lightweight and easy to use.

## Features

- Create or join a shared room with a room ID  
- Live code editing with real-time syncing for multiple users 
- Clean and minimal interface  
- CodeMirror editor  
- No login or authentication needed  

## Technologies used

- React for the frontend  
- Node and Express for the backend  
- Socket.IO for real-time communication  
- CodeMirror for the editor  
- JavaScript throughout  

## Running the project

You need Node installed before running the app. The project has two parts: the backend and the frontend.

### Backend (server folder)

Open a terminal and go to the server folder:
cd server

Install dependencies:
npm install/ npm i

Start the server:
npm start/ node index.js (depends on configuration, both will work here)

The backend will run at:
http://localhost:5000


### Frontend (client folder)

Open another terminal and go to the client folder:
cd client

Install dependencies:
npm install/ npm i

Create a `.env` file inside the client folder and make the following changes:
REACT_APP_BACKEND_URL=http://localhost:5000  //connects the backend

Start the React app:
npm start


The frontend can be seen and used at:
http://localhost:3000

## How it works

The frontend connects to the backend through Socket.IO. Whenever someone types, the updated code is sent to the server, and the server broadcasts the change to everyone else in the same room, keeping all editors in sync.





