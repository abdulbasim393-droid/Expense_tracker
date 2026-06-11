from flask import Blueprint, request, jsonify
from extensions import db
from models.expense import Expense

expense = Blueprint("expense", __name__)


# CREATE EXPENSE
@expense.route("/expenses", methods=["POST"])
def add_expense():

    data = request.get_json()

    title = data.get("title")
    amount = data.get("amount")
    category = data.get("category")
    user_id = data.get("user_id")

    if not title or amount is None or not category or not user_id:
        return jsonify({
            "message": "All fields are required"
        }), 400

    new_expense = Expense(
        title=title,
        amount=amount,
        category=category,
        user_id=user_id
    )

    db.session.add(new_expense)
    db.session.commit()

    return jsonify({
        "message": "Expense added successfully"
    }), 201


# GET ALL EXPENSES
@expense.route("/expenses", methods=["GET"])
def get_expenses():

    expenses = Expense.query.all()

    result = []

    for expense_item in expenses:
        result.append({
            "id": expense_item.id,
            "title": expense_item.title,
            "amount": expense_item.amount,
            "category": expense_item.category,
            "user_id": expense_item.user_id
        })

    return jsonify(result), 200


# GET SINGLE EXPENSE
@expense.route("/expenses/<int:id>", methods=["GET"])
def get_expense(id):

    expense_item = db.session.get(Expense, id)

    if not expense_item:
        return jsonify({
            "message": "Expense not found"
        }), 404

    return jsonify({
        "id": expense_item.id,
        "title": expense_item.title,
        "amount": expense_item.amount,
        "category": expense_item.category,
        "user_id": expense_item.user_id
    }), 200


# UPDATE EXPENSE
@expense.route("/expenses/<int:id>", methods=["PUT"])
def update_expense(id):

    expense_item = db.session.get(Expense, id)

    if not expense_item:
        return jsonify({
            "message": "Expense not found"
        }), 404

    data = request.get_json()

    expense_item.title = data.get(
        "title",
        expense_item.title
    )

    expense_item.amount = data.get(
        "amount",
        expense_item.amount
    )

    expense_item.category = data.get(
        "category",
        expense_item.category
    )

    db.session.commit()

    return jsonify({
        "message": "Expense updated successfully"
    }), 200


# DELETE EXPENSE
@expense.route("/expenses/<int:id>", methods=["DELETE"])
def delete_expense(id):

    expense_item = db.session.get(Expense, id)

    if not expense_item:
        return jsonify({
            "message": "Expense not found"
        }), 404

    db.session.delete(expense_item)
    db.session.commit()

    return jsonify({
        "message": "Expense deleted successfully"
    }), 200