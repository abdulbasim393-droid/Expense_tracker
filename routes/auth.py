from flask import Blueprint, request, jsonify
from extensions import db
from models.user import User
from extensions import db, bcrypt



auth = Blueprint("auth", __name__)

@auth.route("/register", methods=["POST"])
def register():

    data = request.get_json()
    existing_user = User.query.filter_by(
        email=data["email"]
        ).first()
    if existing_user:
        return jsonify({
            "message": "Email already exists"
            }), 400

    hashed_password = bcrypt.generate_password_hash(
        data["password"]
    ).decode("utf-8")

    user = User(
        username=data["username"],
        email=data["email"],
        password=hashed_password
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "User registered successfully"
    }), 201