# 🏥 AuraHealth: Cradle-to-Grave Wellness System

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white)](https://ai.google.dev/)

**AuraHealth** is an AI-integrated healthcare management platform designed to track and optimize health data from birth to old age. By leveraging **Google Gemini AI**, the system provides proactive health insights, vaccination tracking, and vitals monitoring to ensure a "Cradle-to-Grave" wellness journey.

---

## 🌟 Key Features

- **🤖 AI-Driven Wellness Insights**: Analyzes patient vitals and history using Gemini AI to provide personalized health recommendations and early warnings.
- **💉 Vaccination Management**: A comprehensive digital tracker for infants and adults to ensure no life-critical doses are missed.
- **📊 Vitals Monitoring**: Interactive tracking for weight, blood pressure, heart rate, and more with visual progress charts.
- **📋 Prescription History**: Digital storage for medical records and prescriptions, easily accessible for future consultations.
- **🔒 Local-First Security**: Built with a robust SQLite backend for fast and secure data management.

---

## 🛠️ Technical Architecture

*   **Frontend**: React.js + Vite (Fast & Modern UI)
*   **Backend**: Node.js + Express
*   **Database**: SQLite (via `better-sqlite3`)
*   **Intelligence**: Gemini 1.5 Flash API
*   **Styling**: Tailwind CSS / Custom CSS

---

## 🚀 Getting Started

1.  **Clone the Project**
    ```bash
    git clone https://github.com/rasanjana-54/AuraHealth-CradleToGrave-System.git
    ```

2.  **Server Setup**
    ```bash
    cd server
    npm install
    npm start
    ```

3.  **Client Setup**
    ```bash
    cd client
    npm install
    npm run dev
    ```

4.  **Environment Variables**
    Add your `GEMINI_API_KEY` to the server's `.env` file to enable AI features.

---

## 📅 Roadmap

- [ ] **Multi-user Support**: Specialized dashboards for Doctors and Patients.
- [ ] **Mobile App**: React Native version for on-the-go tracking.
- [ ] **PDF Reports**: One-click health summary generation for medical visits.

---

### 🛡️ Disclaimer
*AuraHealth is a wellness management tool and should not be used as a substitute for professional medical advice, diagnosis, or treatment.*

---
**Developed with care by [Rasanjana](https://github.com/rasanjana-54)**
