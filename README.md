
# VISUALITY AI - Forensic Analysis Tool

**Visuality** is a professional-grade forensic tool designed to distinguish between natural content and generative AI synthesis. It leverages advanced deep learning signals to analyze both images and text, providing detailed biometric audits, frequency spectrum analysis, and linguistic stylometry reports.

![Visuality Dashboard](https://via.placeholder.com/800x400?text=Visuality+Forensics+Dashboard)

## 🚀 Features

### 📸 Visual Forensics (Image Analysis)
*   **Deep Biometric Audit**: Analyzes anatomical consistency in faces (pupils, skin texture, hair).
*   **Physics Engine**: Checks for lighting inconsistencies, shadow logic, and reflection geometry.
*   **Digital Artifacts**: Detects frequency spectrum anomalies, lack of sensor noise (PRNU), and upscaling artifacts typical of diffusion models.
*   **Interactive Reports**: View scores for specific signals (CNN, PRNU, Frequency) and a generated forensic summary.
*   **PDF Export**: Generate high-quality, A4-formatted PDF reports of the analysis.

### 📝 Linguistic Forensics (Text Analysis)
*   **Stylometry Engine**: Detects formulaic sentence structures, lack of idiosyncrasies, and overuse of specific transition words.
*   **Perplexity & Burstiness**: Analyzes the predictability of text to flag machine-generated patterns.
*   **Document Support**: Upload `.txt`, `.md`, or `.pdf` files for analysis (client-side PDF parsing included).
*   **Sentence Highlighting**: Visually flags suspicious sentences directly in the report.

### 💼 Enterprise Features (Demo)
*   **Authentication**: **Real Google OAuth** (production ready) and simulated email login (for demo).
*   **Subscription Model**: Tiered access (Free, Pro, Enterprise) with credit usage tracking.
*   **Payment Gateway**: **Mock Payment Simulation** included for demonstration purposes.
*   **Analysis History**: Local storage persistence of past reports for easy review.

---

## 🛠️ Technical Architecture

*   **Frontend**: React 18, TypeScript, Tailwind CSS
*   **Auth**: Google Identity Services (OAuth 2.0)
*   **AI Engine**: Google Gemini Flash 2.5 (via `@google/genai` SDK)
*   **PDF Processing**: `pdfjs-dist` for client-side text extraction, `jspdf` & `html2canvas` for report generation.
*   **Backend**: Serverless-ready Express app (optional, currently used for health checks).

---

## 📦 Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/visuality-ai.git
cd visuality-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory.

```env
# Required for AI Analysis
API_KEY=your_google_gemini_api_key_here

# Required for Real Google Sign-In
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

#### 🔑 How to get `REACT_APP_GOOGLE_CLIENT_ID`:
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a project and go to **APIs & Services > Credentials**.
3.  Click **Create Credentials > OAuth client ID**.
4.  Select **Web application**.
5.  Add **Authorized JavaScript origins**:
    *   `http://localhost:3000`
    *   `https://your-vercel-app.vercel.app` (Your production URL)
6.  Copy the **Client ID** and paste it into your `.env` file.

### 4. Run the Application
```bash
npm start
```
The app will launch at `http://localhost:3000`.

---

## 🚀 Vercel Deployment Guide

This project is optimized for deployment on Vercel, providing a seamless CI/CD pipeline and global CDN hosting.

### Prerequisites
1.  **GitHub Account**: Ensure this project is pushed to a repository on your GitHub account.
2.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
3.  **Google Cloud Console Access**: To configure OAuth.

### Step-by-Step Deployment

#### 1. Import Project to Vercel
1.  Log in to your Vercel Dashboard.
2.  Click **"Add New"** > **"Project"**.
3.  Select your GitHub repository (`visuality-ai`) and click **"Import"**.

#### 2. Configure Build Settings
Vercel usually auto-detects the framework (Create React App).
*   **Framework Preset**: Ensure it is set to **Create React App**.
*   **Root Directory**: `./` (Default)

#### 3. Set Environment Variables (CRITICAL)
Expand the **"Environment Variables"** section before clicking Deploy. You must add the following keys so the app can function:

| Variable Name | Description |
| :--- | :--- |
| `API_KEY` | Your **Google Gemini API Key**. Get it from [Google AI Studio](https://aistudiocdn.com/google-ai-studio). |
| `REACT_APP_GOOGLE_CLIENT_ID` | Your **Google OAuth Client ID**. Get it from [Google Cloud Console](https://console.cloud.google.com/). |

#### 4. Deploy
1.  Click **"Deploy"**.
2.  Vercel will install dependencies, build the project, and assign a production domain (e.g., `https://visuality-ai.vercel.app`).

#### 5. Post-Deployment Configuration (Google OAuth)
Once deployed, you must update your Google Cloud Console credentials to allow the new Vercel domain.

1.  Go to [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials).
2.  Select your **OAuth 2.0 Client ID**.
3.  Under **Authorized JavaScript origins**, click "Add URI".
4.  Paste your Vercel domain (e.g., `https://your-project.vercel.app`).
    *   *Note: Do not add a trailing slash to the URL.*
5.  Click **Save**.
6.  Wait a few minutes for changes to propagate, then test the Login functionality on your live site.

### Troubleshooting
*   **Login Fails**: Check the browser console. If you see `idpiframe_initialization_failed`, it usually means the origin URI is missing or incorrect in Google Cloud Console.
*   **Analysis Fails**: Verify the `API_KEY` is correct in Vercel Project Settings. You may need to redeploy the project if you change environment variables.

---

## ⚠️ Disclaimer

**Visuality AI** provides probabilistic analysis based on current state-of-the-art detection techniques. It is **not** a legal determination of authenticity. Generative models evolve rapidly, and false positives/negatives are possible. Always use human expert verification for high-stakes decisions.

---

&copy; 2024 Visuality AI. All rights reserved.
