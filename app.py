import os
import json
import uuid
from datetime import datetime, date
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production")

DATA_FILE = os.environ.get("DATA_FILE", "data.json")


def load_data():
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r") as f:
                return json.load(f)
        except (json.JSONDecodeError, ValueError):
            pass
    return {"transactions": [], "accounts": []}


def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2, default=str)


@app.route("/")
def index():
    data = load_data()
    transactions = data.get("transactions", [])
    accounts = data.get("accounts", [])

    total_income = sum(t["amount"] for t in transactions if t.get("type") == "income")
    total_expenses = sum(t["amount"] for t in transactions if t.get("type") == "expense")
    balance = total_income - total_expenses

    recent_transactions = sorted(
        transactions, key=lambda t: t.get("date", ""), reverse=True
    )[:10]

    return render_template(
        "index.html",
        transactions=recent_transactions,
        accounts=accounts,
        total_income=total_income,
        total_expenses=total_expenses,
        balance=balance,
    )


@app.route("/transactions")
def transactions():
    data = load_data()
    transactions = sorted(
        data.get("transactions", []),
        key=lambda t: t.get("date", ""),
        reverse=True,
    )
    accounts = data.get("accounts", [])
    return render_template("transactions.html", transactions=transactions, accounts=accounts)


@app.route("/transactions/new", methods=["GET", "POST"])
def new_transaction():
    data = load_data()
    accounts = data.get("accounts", [])

    if request.method == "POST":
        transaction = {
            "id": str(uuid.uuid4()),
            "date": request.form.get("date", str(date.today())),
            "description": request.form.get("description", ""),
            "amount": float(request.form.get("amount", 0)),
            "type": request.form.get("type", "expense"),
            "category": request.form.get("category", ""),
            "account_id": request.form.get("account_id", ""),
            "created_at": str(datetime.now()),
        }
        data.setdefault("transactions", []).append(transaction)
        save_data(data)
        flash("Transaction added successfully!", "success")
        return redirect(url_for("transactions"))

    return render_template("transaction_form.html", accounts=accounts, transaction=None, today=str(date.today()))


@app.route("/transactions/<transaction_id>/edit", methods=["GET", "POST"])
def edit_transaction(transaction_id):
    data = load_data()
    transactions = data.get("transactions", [])
    accounts = data.get("accounts", [])
    transaction = next((t for t in transactions if t["id"] == transaction_id), None)

    if not transaction:
        flash("Transaction not found.", "error")
        return redirect(url_for("transactions"))

    if request.method == "POST":
        transaction.update(
            {
                "date": request.form.get("date", transaction["date"]),
                "description": request.form.get("description", ""),
                "amount": float(request.form.get("amount", 0)),
                "type": request.form.get("type", "expense"),
                "category": request.form.get("category", ""),
                "account_id": request.form.get("account_id", ""),
                "updated_at": str(datetime.now()),
            }
        )
        save_data(data)
        flash("Transaction updated successfully!", "success")
        return redirect(url_for("transactions"))

    return render_template("transaction_form.html", accounts=accounts, transaction=transaction)


@app.route("/transactions/<transaction_id>/delete", methods=["POST"])
def delete_transaction(transaction_id):
    data = load_data()
    data["transactions"] = [
        t for t in data.get("transactions", []) if t["id"] != transaction_id
    ]
    save_data(data)
    flash("Transaction deleted.", "info")
    return redirect(url_for("transactions"))


@app.route("/accounts")
def accounts():
    data = load_data()
    accounts_list = data.get("accounts", [])
    transactions = data.get("transactions", [])

    for account in accounts_list:
        account_transactions = [
            t for t in transactions if t.get("account_id") == account["id"]
        ]
        income = sum(t["amount"] for t in account_transactions if t.get("type") == "income")
        expenses = sum(t["amount"] for t in account_transactions if t.get("type") == "expense")
        account["balance"] = income - expenses

    return render_template("accounts.html", accounts=accounts_list)


@app.route("/accounts/new", methods=["GET", "POST"])
def new_account():
    if request.method == "POST":
        data = load_data()
        account = {
            "id": str(uuid.uuid4()),
            "name": request.form.get("name", ""),
            "type": request.form.get("type", "checking"),
            "description": request.form.get("description", ""),
            "created_at": str(datetime.now()),
        }
        data.setdefault("accounts", []).append(account)
        save_data(data)
        flash("Account created successfully!", "success")
        return redirect(url_for("accounts"))

    return render_template("account_form.html", account=None)


@app.route("/accounts/<account_id>/edit", methods=["GET", "POST"])
def edit_account(account_id):
    data = load_data()
    accounts_list = data.get("accounts", [])
    account = next((a for a in accounts_list if a["id"] == account_id), None)

    if not account:
        flash("Account not found.", "error")
        return redirect(url_for("accounts"))

    if request.method == "POST":
        account.update(
            {
                "name": request.form.get("name", account["name"]),
                "type": request.form.get("type", account["type"]),
                "description": request.form.get("description", ""),
                "updated_at": str(datetime.now()),
            }
        )
        save_data(data)
        flash("Account updated successfully!", "success")
        return redirect(url_for("accounts"))

    return render_template("account_form.html", account=account)


@app.route("/accounts/<account_id>/delete", methods=["POST"])
def delete_account(account_id):
    data = load_data()
    data["accounts"] = [
        a for a in data.get("accounts", []) if a["id"] != account_id
    ]
    save_data(data)
    flash("Account deleted.", "info")
    return redirect(url_for("accounts"))


@app.route("/reports")
def reports():
    data = load_data()
    transactions = data.get("transactions", [])

    monthly_summary = {}
    for t in transactions:
        month_key = t.get("date", "")[:7]
        if month_key not in monthly_summary:
            monthly_summary[month_key] = {"income": 0, "expenses": 0}
        if t.get("type") == "income":
            monthly_summary[month_key]["income"] += t["amount"]
        else:
            monthly_summary[month_key]["expenses"] += t["amount"]

    category_summary = {}
    for t in transactions:
        cat = t.get("category", "Uncategorized") or "Uncategorized"
        if cat not in category_summary:
            category_summary[cat] = {"income": 0, "expenses": 0}
        if t.get("type") == "income":
            category_summary[cat]["income"] += t["amount"]
        else:
            category_summary[cat]["expenses"] += t["amount"]

    return render_template(
        "reports.html",
        monthly_summary=sorted(monthly_summary.items(), reverse=True),
        category_summary=sorted(category_summary.items()),
    )


@app.route("/api/summary")
def api_summary():
    data = load_data()
    transactions = data.get("transactions", [])
    total_income = sum(t["amount"] for t in transactions if t.get("type") == "income")
    total_expenses = sum(t["amount"] for t in transactions if t.get("type") == "expense")
    return jsonify(
        {
            "total_income": total_income,
            "total_expenses": total_expenses,
            "balance": total_income - total_expenses,
            "transaction_count": len(transactions),
            "account_count": len(data.get("accounts", [])),
        }
    )


@app.route("/health")
def health():
    return jsonify({"status": "healthy", "timestamp": str(datetime.now())})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=os.environ.get("FLASK_DEBUG", "false").lower() == "true")
