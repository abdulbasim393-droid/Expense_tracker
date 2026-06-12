from flask import Blueprint, request, jsonify
from extensions import db
from models.expense import Expense
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

expense = Blueprint("expense", __name__)


# CREATE EXPENSE
@expense.route("/expenses", methods=["POST"])
@jwt_required()
def add_expense():

    current_user_id = int(get_jwt_identity())

    data = request.get_json()

    new_expense = Expense(
        title=data["title"],
        amount=data["amount"],
        category=data["category"],
        user_id=current_user_id
    )

    db.session.add(new_expense)
    db.session.commit()

    return jsonify({
        "message": "Expense added successfully"
    }), 201



# GET ALL EXPENSES
@expense.route("/expenses", methods=["GET"])
@jwt_required()
def get_expenses():

    current_user_id = int(get_jwt_identity())
    expenses = Expense.query.filter_by(
        user_id=current_user_id
        ).all()

    result = []

    for expense_item in expenses:
        result.append({
            "id": expense_item.id,
            "title": expense_item.title,
            "amount": expense_item.amount,
            "category": expense_item.category,
            "created_at": expense_item.created_at.isoformat(),
            "user_id": expense_item.user_id
        })

    return jsonify(result), 200


# GET SINGLE EXPENSE
@expense.route("/expenses/<int:id>", methods=["GET"])
@jwt_required()
def get_expense(id):

    current_user_id = int(get_jwt_identity())
    expense_item = Expense.query.filter_by(
        id=id,
        user_id=current_user_id
        ).first()

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
@jwt_required()
def update_expense(id):



    current_user_id = int(get_jwt_identity())
    expense_item = Expense.query.filter_by(
        id=id,
        user_id=current_user_id
    ).first()

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
@jwt_required()
def delete_expense(id):

    current_user_id = int(get_jwt_identity())

    expense_item = Expense.query.filter_by(
        id=id,
        user_id=current_user_id
    ).first()

    if not expense_item:
        return jsonify({
            "message": "Expense not found"
        }), 404

    db.session.delete(expense_item)
    db.session.commit()

    return jsonify({
        "message": "Expense deleted successfully"
    }), 200