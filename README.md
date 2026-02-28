# 🚀 KAIRO – Privacy-First Encrypted Chat (Open Source)

A modern, end-to-end encrypted web chat application with device-based key control, installable PWA support, and fully customizable architecture.

Built using:
- Vanilla JavaScript
- Firebase (Auth + Firestore)
- Tailwind CSS
- Service Worker (Offline Support)
- Progressive Web App (PWA)

---

# ✨ Why This Project Exists

This project is designed to be:

- 🔐 Privacy-first
- 🧩 Fully customizable
- 🧠 AI-tool friendly
- 🔄 Replaceable backend architecture
- 📱 Installable as a web app
- 🚀 Easy to fork and rebrand

You can:
- Change the UI
- Change authentication
- Change database
- Add/remove features
- Convert it into React / Next.js / Vue
- Replace Firebase with any backend

---

# 📁 Project Structure

```
/index.html      → Main app UI and logic
/manifest.json   → PWA configuration
/sw.js           → Service worker (offline caching)
```

---

# 🎨 Customization Guide

## 🏷 Change App Name

Update the following:

### 1️⃣ Inside `index.html`
Change:
```html
<title>KAIRO | Private Chat</title>
```

### 2️⃣ Inside `manifest.json`
```json
{
  "name": "Your App Name",
  "short_name": "YourApp"
}
```

### 3️⃣ Replace all text "KAIRO" in the HTML file

---


# 🔐 Authentication System

Default:
- Google Authentication (Firebase Auth)

You can replace with:

- Email + Password
- GitHub OAuth
- Phone OTP
- Custom JWT backend
- Supabase Auth
- Auth0
- Any backend auth provider

To change:
1. Remove Firebase auth logic
2. Add your provider SDK
3. Connect it with your database

---

# 🗄 Database System

Default:
- Firebase Firestore

But you can switch to:

- MongoDB
- PostgreSQL
- MySQL
- Supabase
- Appwrite
- IndexedDB
- localStorage (for demo builds)

---

## 🔥 If Using Firebase Firestore

### Step 1: Add Your Firebase Config

```js
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

Enable:
- Authentication
- Firestore Database

---

## 🔐 Firestore Security Rules

If using encrypted messaging:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
  
    // ==========================================================
    // 1. INVITE CODES (Onboarding Step 1)
    // ==========================================================
    match /inviteCodes/{codeId} {
      allow read: if true;
      allow update: if request.auth != null;
    }

    // ==========================================================
    // 2. USERS & DIRECTORY
    // ==========================================================
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
      
      match /friends/{friendId} {
        allow read: if request.auth != null && request.auth.uid == userId;
        allow write: if request.auth != null && (request.auth.uid == userId || request.auth.uid == friendId);
      }

      match /nicknames/{targetId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /device_sync/{syncId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    // ==========================================================
    // 3. CONNECTION REQUESTS
    // ==========================================================
    match /connection_requests/{requestId} {
      allow read: if request.auth != null;
      
      allow create: if request.auth != null 
                    && request.resource.data.from == request.auth.uid;
      
      allow delete: if request.auth != null 
                    && (resource.data.from == request.auth.uid || resource.data.to == request.auth.uid);
      
      allow update: if false;
    }
    
    // ==========================================================
    // 4. SHARED CHAT ROOMS & MESSAGES
    // ==========================================================
    match /rooms/{roomId} {
      allow read, update, delete: if request.auth != null && request.auth.uid in resource.data.participants;
      allow create: if request.auth != null && request.auth.uid in request.resource.data.participants;
      
      match /messages/{messageId} {
        allow read: if request.auth != null && request.auth.uid in get(/databases/$(database)/documents/rooms/$(roomId)).data.participants;
        
        allow create: if request.auth != null 
                      && request.auth.uid in get(/databases/$(database)/documents/rooms/$(roomId)).data.participants
                      && request.resource.data.senderId == request.auth.uid
                      && (
                        // Standard E2EE messages (1:1 chats)
                        (request.resource.data.keys().hasAll(['senderId', 'ciphertext', 'iv'])
                         && !request.resource.data.keys().hasAny(['text']))
                        ||
                        // System vote messages
                        (request.resource.data.type == 'vote'
                         && request.resource.data.keys().hasAll(['senderId', 'type', 'voteType', 'votes', 'status']))
                        ||
                        // Group multi-recipient E2EE messages
                        (request.resource.data.keys().hasAll(['senderId', 'recipients'])
                         && !request.resource.data.keys().hasAny(['text']))
                      );
                      
        allow delete, update: if request.auth != null 
                              && request.auth.uid in get(/databases/$(database)/documents/rooms/$(roomId)).data.participants;
      }
    }
  }
}

```

⚠️ Modify these rules for production-level security.

---

# 🔑 Encryption & Key System

This project includes:

- Device-based private key storage
- Secure key transfer system (sync codes)
- Key reset mechanism
- Encryption validation UI
- End-to-end encryption indicators

To remove encryption:
- Remove key generation logic
- Remove sync modal
- Remove missing key overlay
- Remove encryption status indicators

---

# 📱 Progressive Web App (PWA)

The app is installable.

Configured in:

- `manifest.json`
- `sw.js`

---

## 🖼 Change App Icon

Replace:

```
/icons/logo.png
/icons/icon-512.png
```

Update sizes if needed.

---

## 🎨 Change Theme Color

Inside `manifest.json`:

```json
"theme_color": "#000000",
"background_color": "#000000"
```

---

# 🛜 Offline Support

The service worker:

- Cache-first strategy for local files
- Network-first for CDN
- Skips Firebase API calls
- Provides offline fallback

To update cache version:

```js
const CACHE_NAME = "your-version-name";
```

---

# 🤖 AI-Friendly Architecture

You can paste `index.html` into any AI tool and ask:

- Convert this into React
- Convert into Next.js
- Replace Firebase with Supabase
- Add file upload system
- Add message reactions
- Improve performance
- Add typing indicators
- Add read receipts
- Add voice messages

This project is structured to be modular and easy to refactor.

---

# 🧩 Features Included

- Invite Code System
- Google Authentication
- Profile Setup
- One-to-one chats
- Group chats
- Search system
- Device linking
- Key synchronization
- End-to-end encryption
- Message intents (Normal / Locked / Self-destruct / Silent)
- Offline caching
- Dark/Light theme
- Installable PWA

---

# 🛠 How to Deploy

## Option 1: Netlify
1. Upload files
2. Set publish directory to root
3. Deploy

## Option 2: Vercel
1. Import repository
2. Deploy as static site

## Option 3: Firebase Hosting
1. `firebase init`
2. `firebase deploy`

---

# 🧠 Contribution Guidelines

You are free to:

- Fork
- Rebrand
- Modify
- Monetize
- Extend
- Convert framework
- Improve security
- Improve UI

Just give proper credit.

---

# 📜 License

MIT License

You are free to use, modify, and distribute.

---

# 🔥 Vision

This project exists so anyone in the world can:

- Build their own secure chat app
- Learn encryption architecture
- Learn PWA concepts
- Learn real-time systems
- Build privacy-first products

---

# ⭐ If You Like This Project

Give it a star.
Fork it.
Build something better.
Push privacy forward.
