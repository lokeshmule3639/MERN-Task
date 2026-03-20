# MERN AI Flow Task

A full-stack application built with the MERN stack (MongoDB, Express, React, Node.js) and React Flow to visualize AI-driven text generation using the OpenRouter API.

## Features
- **Visual Flow**: Input and Result nodes connected by an edge using React Flow.
- **AI Integration**: Proxied requests to OpenRouter (using `openrouter/auto` to find free models).
- **History Management**: Save prompts and responses to MongoDB and view history in a sidebar.
- **Deployment Ready**: Optimized for Render.com with unified build scripts.

## Tech Stack
- **Frontend**: React, React Flow, Axios, Lucide-React, Vite.
- **Backend**: Node.js, Express.js, Mongoose, Axios, Dotenv.
- **Database**: MongoDB.
- **AI API**: OpenRouter.

## How to Run Locally

### Prerequisites
- Node.js installed.
- MongoDB installed and running locally.
- An OpenRouter API key.

### Steps
1. **Clone the repository**:
   ```bash
   git clone https://github.com/lokeshmule3639/MERN-Task.git
   cd MERN-Task
   ```

2. **Install Dependencies**:
   ```bash
   npm run install-all
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `backend` folder:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/mern-task
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

4. **Start the Application**:
   ```bash
   npm run dev
   ```
   - Frontend will run on: `http://localhost:5173`
   - Backend will run on: `http://localhost:5000`

## Deployment on Render.com

1. Create a **New Web Service** on Render and connect your GitHub repo.
2. Set the following:
   - **Build Command**: `npm run install-all && npm run build`
   - **Start Command**: `NODE_ENV=production npm start`
3. Add **Environment Variables** in the Render Dashboard:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `OPENROUTER_API_KEY`: Your OpenRouter API key.
   - `NODE_ENV`: `production`

---
*Created for FutureBlink - MERN App Developer Task.*
