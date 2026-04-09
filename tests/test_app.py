import pytest
import json
import os
import tempfile
from datetime import date

# Point the app at a temp file so tests don't write to production data
_fd, _tmp_data_file = tempfile.mkstemp(suffix=".json")
os.close(_fd)
os.environ["DATA_FILE"] = _tmp_data_file

from app import app as flask_app


@pytest.fixture
def client():
    flask_app.config["TESTING"] = True
    with flask_app.test_client() as client:
        yield client


def test_health(client):
    """Health endpoint returns 200 and healthy status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data["status"] == "healthy"


def test_index(client):
    """Dashboard loads successfully."""
    response = client.get("/")
    assert response.status_code == 200
    assert b"OyVey" in response.data


def test_transactions_page(client):
    """Transactions page loads successfully."""
    response = client.get("/transactions")
    assert response.status_code == 200


def test_new_transaction_get(client):
    """New transaction form loads."""
    response = client.get("/transactions/new")
    assert response.status_code == 200


def test_new_transaction_post(client):
    """Posting a new transaction redirects to transactions list."""
    response = client.post(
        "/transactions/new",
        data={
            "date": str(date.today()),
            "description": "Test expense",
            "amount": "50.00",
            "type": "expense",
            "category": "Office Supplies",
            "account_id": "",
        },
        follow_redirects=False,
    )
    assert response.status_code == 302


def test_accounts_page(client):
    """Accounts page loads successfully."""
    response = client.get("/accounts")
    assert response.status_code == 200


def test_new_account_post(client):
    """Posting a new account redirects to accounts list."""
    response = client.post(
        "/accounts/new",
        data={
            "name": "Test Checking",
            "type": "checking",
            "description": "Test account",
        },
        follow_redirects=False,
    )
    assert response.status_code == 302


def test_reports_page(client):
    """Reports page loads successfully."""
    response = client.get("/reports")
    assert response.status_code == 200


def test_api_summary(client):
    """API summary returns expected keys."""
    response = client.get("/api/summary")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "total_income" in data
    assert "total_expenses" in data
    assert "balance" in data
