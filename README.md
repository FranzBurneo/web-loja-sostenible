# Web Frontend for Loja Sostenible

This repository contains the frontend code for the **Loja Sostenible** application. It is a web-based platform designed to support and promote Sustainable Development Goals (SDGs) in Loja by enabling collaboration and engagement among various stakeholders.

## Features

The web frontend provides the following functionalities:

- **User Management:**
  - User registration, including optional verification with ID and personal details.
  - User login with email and password or social media (Google and Facebook).
  - Role-based access control for administrators, creators, and regular users.

- **Publications Management:**
  - Create, edit, delete, and manage the visibility of publications.
  - Add images, tags, and categories to publications.
  - Share publications via unique links.
  
- **Comments and Interaction:**
  - Add, edit, delete, and reply to comments on publications.
  - Record user participation through likes or other interactions.

- **Survey Management:**
  - Create, modify, and delete surveys with multiple question types.
  - Respond to surveys and view summarized results.

- **Informative Section:**
  - Access detailed information about each Sustainable Development Goal (SDG).
  - View a dedicated section outlining the platform's purpose and mission.

## Technologies Used

- **React.js:** Frontend library for building user interfaces.
- **React Router:** For routing and navigation.
- **Axios:** For API requests and data fetching.
- **Firebase:** Authentication and storage integration.
- **Material-UI:** For pre-built and customizable UI components.

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/your-repo/loja-sostenible-web.git
   ```

2. Navigate to the project directory:
   ```bash
   cd loja-sostenible-web
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

1. Fill `.env` varibales.

2. Ensure the backend API URL is set correctly in the environment variables if required:
   ```env
   REACT_APP_BACKEND_URL=https://your-backend-url.com
   ```

## Usage

1. Start the development server:
   ```bash
   npm start
   ```

2. Open the application in your browser:
   ```
   http://localhost:3000
   ```

## Deployment

1. Build the project for production:
   ```bash
   npm run build
   ```

2. Deploy the contents of the `build/` directory to your hosting provider.

## Screenshots

### User Registration
<img src="" alt="User Registration" height="200">

### Publications Management
<img src="" alt="Publications Management" height="200">

### Survey Management
<img src="" alt="Survey Management" height="200">

### Informative Section
<img src="" alt="Informative Section" height="200">
