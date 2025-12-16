# Healthcare System - Full Stack Setup

## Frontend (React + Vite)

The frontend is already set up in this project. To run it:

```bash
npm run dev
```

The app will be available at the local dev server.

### Default Credentials

Use these credentials to log in:

- **User**: username=`user1`, password=`password123`
- **Admin**: username=`admin1`, password=`password123`
- **Configurator**: username=`config1`, password=`password123`

## Backend (Python Flask)

### Prerequisites
- Python 3.8+
- pip (Python package manager)

### Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run the Flask backend:
```bash
python backend.py
```

The backend will run on `http://localhost:5000`

### API Endpoints

#### 1. POST /login
Logs in a user and returns their role.

Request:
```json
{
  "username": "string",
  "password": "string",
  "role": "user|admin|configurator"
}
```

Response:
```json
{
  "success": true,
  "role": "user|admin|configurator"
}
```

#### 2. POST /configurator/create-session
Creates a new configurator session with input data.

Request:
```json
{
  "role": "configurator",
  "mode": "run|test|calibrate",
  "data": {
    "key1": "value1",
    "key2": "value2"
  }
}
```

Response:
```json
{
  "success": true,
  "sessionFolder": "configurator_run_16_12_2025_20_33"
}
```

## Application Flow

1. **Login Page** (`/login`)
   - Enter username and password
   - Select a role (user, admin, or configurator)
   - Click Login

2. **Role-Based Redirect**
   - User → `/user` (User Dashboard)
   - Admin → `/admin` (Admin Dashboard)
   - Configurator → `/configurator` (Configurator Input Page)

3. **Configurator Page** (`/configurator`)
   - Choose input method (File Upload or Manual Entry)
   - File Upload: Upload .json, .yaml, or .yml files
   - Manual Entry: Add unlimited key-value pairs
   - Select operation mode (run, test, or calibrate)
   - Click Continue

4. **Landing Page** (`/configurator/landing`)
   - Shows 4 clickable module containers
   - Modules can be clicked for future interactions

## Directory Structure

```
project-root/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── UserPage.tsx
│   │   ├── AdminPage.tsx
│   │   ├── ConfiguratorPage.tsx
│   │   └── LandingPage.tsx
│   ├── components/
│   │   ├── FileUploadMode.tsx
│   │   └── ManualEntryMode.tsx
│   └── styles/
│       ├── LoginPage.css
│       ├── SimplePage.css
│       ├── ConfiguratorPage.css
│       ├── FileUploadMode.css
│       ├── ManualEntryMode.css
│       └── LandingPage.css
├── backend.py
├── requirements.txt
├── package.json
└── vite.config.ts
```

## Session Storage

Configurator sessions are stored in `configurator_sessions/` directory with the following structure:

```
configurator_sessions/
└── configurator_run_16_12_2025_20_33/
    ├── input/
    │   └── initial_data.json
    └── output/
```

## Notes

- No authentication framework is used; the login endpoint accepts any credentials
- No database is used; all data is stored in the file system
- CORS is enabled on the Flask backend to allow frontend requests
- The application uses functional React components with hooks
