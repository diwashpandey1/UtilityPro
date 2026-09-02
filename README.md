# UtilityPro

UtilityPro is a web-based collection of everyday utility tools designed to help with common productivity, creative, and development tasks in one place. The project is actively being developed, and more tools and features will be added in the future.

> More tools and features will be added in the future.

## 🌐 Live Demo

Live demo: https://utilitypro.web.app/

## ✨ Features

The current application includes the following tools:

- QR Code Generator
- QR Code Scanner
- Password Generator
- Color Picker
- Image Compressor

The app also includes Firebase-based authentication flows and a responsive interface for browsing utilities.

## 🛠️ Tech Stack

This project is built with:

- React
- Vite
- JavaScript
- Firebase
- Supabase
- CSS
- Tailwind CSS
- React Router
- Framer Motion
- React Toastify
- Lucide React
- ESLint

## 📁 Project Structure

```text
UtilityPro/
├── .github/                # GitHub automation and deployment workflows
├── public/                 # Static public assets
├── src/                    # Application source code
│   ├── assets/             # Images, backgrounds, and static media
│   ├── auth/               # Login, signup, and profile screens
│   ├── backend/            # Firebase and Supabase configuration
│   ├── components/         # Shared UI sections
│   ├── context/            # Authentication context
│   ├── data/               # Tool metadata and app data
│   ├── helper/             # Reusable helpers and dialogs
│   ├── pages/              # Main app pages
│   ├── tools/              # Tool pages and tool-specific components
│   ├── App.jsx             # App routing
│   ├── index.css           # Global styling
│   └── main.jsx            # Application entry point
├── worker/                 # Cloudflare Worker for ImageKit operations
│   ├── src/index.js        # Authenticated ImageKit API and ownership checks
│   └── wrangler.toml       # Worker configuration and public project variables
├── .env.example            # Example environment variables file
├── .firebaserc             # Firebase project configuration
├── .gitignore              # Git exclusions
├── eslint.config.js        # ESLint configuration
├── firebase.json           # Firebase hosting config
├── index.html              # Base HTML entry
├── package.json            # Project scripts and dependencies
├── package-lock.json       # Installed dependency lockfile
├── README.md               # Project documentation
├── vite.config.js          # Vite configuration
└── public/                 # Static files served by the app
```

## 🚀 Getting Started

### Clone

```bash
git clone <repository-url>
cd UtilityPro
```

### Install dependencies

```bash
npm install
```

### Environment variables

This project uses environment variables for Firebase and Supabase configuration. Copy the example file and fill in your own values:

```bash
cp .env.example .env
```

The file should include variables such as:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_IMAGEKIT_API_URL` - The deployed Cloudflare Worker URL

Do not commit real credentials. Keep `.env`, Worker secret files such as
`worker/.dev.vars`, private keys, certificates, service-account files, and
the `secrets/` directory private. Only `.env.example` belongs in Git.

### ImageKit Worker

The Cloudflare Worker handles ImageKit authentication and deletion. Configure
its secrets locally with Wrangler; do not put them in `wrangler.toml` or the
repository:

```bash
cd worker
npx wrangler secret put IMAGEKIT_PRIVATE_KEY
npx wrangler secret put IMAGEKIT_PUBLIC_KEY
```

The Worker verifies the Firebase ID token, reads the authenticated user's
Firestore document at `user/{uid}`, and permits deletion only when the
requested ImageKit file ID matches `profilePicture.fileId` or the top-level
`fileId`. Firestore REST responses use typed fields, so the Worker explicitly
extracts `stringValue` from the nested `mapValue.fields` structure.

When replacing a profile picture, the existing ImageKit file is deleted while
its ID is still stored in Firestore. The new upload metadata is written only
after that ownership check succeeds.

Deploy the Worker from the `worker/` directory after configuring its secrets:

```bash
npx wrangler deploy
```

### Run locally

```bash
npm run dev
```

### Build

```bash
npm run build
```

## 🔐 Authentication

Authentication is handled through Firebase configuration in the app, with Supabase also configured for storage and backend connectivity. Private keys and environment values should remain in a local `.env` file and should never be committed to the repository.

## 🗺️ Future Development

UtilityPro is an ongoing project. Additional tools are planned, existing utilities may continue to improve, and new functionality may be introduced over time as the project evolves.

## 🤝 Contributing

Contributions, feedback, and issues are welcome. Please open an issue or submit a pull request with a clear description of the change.

---

This project is being maintained and expanded as a utility-focused web application for everyday use.
