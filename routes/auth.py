from flask import Blueprint, request, jsonify
from extensions import db
from models.user import User

auth = Blueprint("auth", __name__)

@auth.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    user = User(
        username=data["username"],
        email=data["email"],
        password=data["password"]
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "User registered successfully"
    }), 201