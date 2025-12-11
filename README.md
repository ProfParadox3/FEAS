# 🕵️‍♂️ Forensic Evidence Acquisition System (FEAS)

![License](https://img.shields.io/badge/License-MIT-blue.svg) ![Python](https://img.shields.io/badge/Python-3.10-blue) ![React](https://img.shields.io/badge/React-18.0-61DAFB) ![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688)

> **Investigator-grade digital forensics platform for acquiring, preserving, and analyzing web and local evidence with an immutable chain of custody.**

---

## 📖 Overview

The **Forensic Evidence Acquisition System (FEAS)** is a secure, full-stack solution designed for law enforcement and digital forensic investigators. It automates the acquisition of evidence from social media URLs and local files, ensuring strict integrity through SHA-256 hashing and automated PDF reporting.

Unlike standard downloaders, FEAS maintains a legally admissible **Chain of Custody** log for every action taken on a piece of evidence, from the moment of acquisition to final storage.

## ✨ Key Features

* **🌐 Universal Acquisition**
    * Capture videos and metadata from **Twitter (X)**, **YouTube**, and direct URLs.
    * Secure **Local File Upload** for existing evidence.
* **🔒 Evidence Integrity**
    * Automated **SHA-256 Hashing** upon acquisition.
    * **Verify Integrity** tools to detect file tampering.
* **⛓️ Chain of Custody**
    * Immutable, append-only logs for every event (Acquisition, Hashing, Storage, Access).
    * Full audit trail exportable in reports.
* **📊 Deep Metadata Extraction**
    * Extracts EXIF data, video codecs, bitrates, and platform-specific metadata using `ffmpeg` and `exiftool`.
* **📄 Automated Reporting**
    * Generates professional **PDF Forensic Reports** containing all case details, hashes, and custody logs.
* **⚡ Real-time Monitoring**
    * Live job tracking via WebSockets and React Query.
    * Background processing with **Celery** and **Redis**.

---

## 🛠️ Tech Stack

### **Backend**
* 🐍 **Python 3.10** & **FastAPI** - High-performance API framework.
* 🗄️ **PostgreSQL** & **SQLAlchemy** - Robust relational database.
* ⚡ **Celery** & **Redis** - Asynchronous task queue for heavy processing.
* 🕵️ **Forensic Tools**: `yt-dlp`, `ffmpeg`, `exifread`, `python-magic`.
* 📄 **ReportLab** - Dynamic PDF generation.

### **Frontend**
* ⚛️ **React 18** - Modern UI library.
* 💅 **Styled Components** - Themed, component-based styling.
* 📡 **React Query** & **Axios** - Efficient data fetching and caching.
* 🎨 **React Icons** - Visual indicators for file types and status.

### **DevOps**
* 🐳 **Docker** & **Docker Compose** - Containerized deployment.

---

## 🚀 Getting Started

### Prerequisites
* Docker & Docker Compose
* **OR** Python 3.10+ and Node.js 18+

### Option 1: Quick Start (Docker) 🐳

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/your-repo/feas.git](https://github.com/your-repo/feas.git)
    cd feas
    ```

2.  **Configure Environment**
    ```bash
    # Backend
    cd backend
    cp .env.example .env
    # Edit .env with your DB credentials if needed
    ```

3.  **Launch Services**
    ```bash
    docker-compose up --build -d
    ```
    * Frontend: `http://localhost:3000`
    * API Docs: `http://localhost:8000/docs`

### Option 2: Manual Installation 🛠️

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Start Redis and Postgres manually, then run:
uvicorn app.main:app --reload
````

#### Frontend Setup

```bash
cd frontend
npm install
npm start
```

-----

## 📸 Screenshots

| Dashboard | Evidence Details |
|:---:|:---:|
| *Real-time monitoring of all forensic jobs* | *Deep dive into metadata and custody logs* |
|  |  |

-----

## 👥 Contributors

A huge thanks to the team that made this project possible:

  * 👨‍💻 **Rana Uzair Ahmad** - [Dynamo2k1](https://github.com/Dynamo2k1)
  * 👨‍💻 **Muammad Usman** - [Prof.Paradox](https://github.com/ProfParadox)
  * 👩‍💻 **Hoor ul Ain** - [hurrainjhl](https://github.com/hurrainjhl)
  * 👩‍💻 **Umae Habiba** - [ZUNATIC](https://github.com/ZUNATIC)

-----

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.

-----

> **Disclaimer:** This software is intended for authorized forensic investigations. Ensure compliance with all local laws regarding data privacy and evidence handling.
