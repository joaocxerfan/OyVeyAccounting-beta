# 💰 OyVey Accounting

A lightweight, self-hosted accounting web application built with Python Flask and deployed on Google Cloud Run.

## 🚀 Live Deployments

| Environment | URL |
|-------------|-----|
| **Production** | https://oyveyaccounting-440525965881.us-west1.run.app |
| **Development** | https://ais-dev-puzhbhgz5zsdbamz7ffxxw-264393058205.us-east1.run.app |

## ✨ Features

- **Dashboard** — Financial summary with income, expenses, and net balance at a glance
- **Transactions** — Add, edit, and delete income/expense entries with categories
- **Accounts** — Manage multiple accounts (checking, savings, credit, cash, investments)
- **Reports** — Monthly and per-category breakdowns
- **REST API** — `/api/summary` endpoint for programmatic access
- **Health check** — `/health` endpoint for Cloud Run liveness probes

## 🛠 Tech Stack

- **Backend:** Python 3.12, Flask
- **Server:** Gunicorn
- **Containerization:** Docker
- **Cloud:** Google Cloud Run (us-west1 prod, us-east1 dev)
- **CI/CD:** GitHub Actions

## 🏃 Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/joaocxerfan/OyVeyAccounting-beta.git
cd OyVeyAccounting-beta

# 2. Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the app
python app.py
```

Open http://localhost:8080 in your browser.

## 🐳 Run with Docker

```bash
docker build -t oyveyaccounting .
docker run -p 8080:8080 oyveyaccounting
```

## 🧪 Tests

```bash
pip install pytest
pytest tests/ -v
```

## 🔄 CI/CD Pipeline

Every push to `main` automatically:

1. **Runs tests** (pytest)
2. **Deploys to Development** (us-east1 Cloud Run)
3. **Deploys to Production** (us-west1 Cloud Run) after dev succeeds

Pull requests trigger a lint/test check and a Docker build smoke test.

## ⚙️ GitHub Secrets Required

Configure these secrets in **Settings → Secrets and variables → Actions**:

| Secret | Environment | Description |
|--------|-------------|-------------|
| `GCP_WORKLOAD_IDENTITY_PROVIDER_PROD` | production | Workload Identity Federation provider for prod |
| `GCP_SERVICE_ACCOUNT_PROD` | production | GCP service account email for prod |
| `GCP_WORKLOAD_IDENTITY_PROVIDER_DEV` | development | Workload Identity Federation provider for dev |
| `GCP_SERVICE_ACCOUNT_DEV` | development | GCP service account email for dev |

## 📁 Project Structure

```
OyVeyAccounting-beta/
├── app.py                    # Flask application
├── requirements.txt          # Python dependencies
├── Dockerfile                # Container image definition
├── .gitignore
├── templates/
│   ├── base.html             # Shared layout
│   ├── index.html            # Dashboard
│   ├── transactions.html     # Transactions list
│   ├── transaction_form.html # Add/edit transaction
│   ├── accounts.html         # Accounts list
│   ├── account_form.html     # Add/edit account
│   └── reports.html          # Financial reports
├── static/
│   ├── css/style.css         # Application styles
│   └── js/app.js             # Client-side scripts
├── tests/
│   └── test_app.py           # Pytest test suite
└── .github/
    └── workflows/
        ├── deploy.yml        # Deploy to Cloud Run on push to main
        └── ci.yml            # PR checks (lint, test, Docker build)
```

## 📄 License

MIT