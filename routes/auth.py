from flask import Blueprint, request, jsonify
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




@auth.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(
        email=email
    ).first()

    if not user:
        return jsonify({
            "message": "User not found"
        }), 404
    
    print(user.password)

    if bcrypt.check_password_hash(
        user.password,
        password
    ):

        return jsonify({
            "message": "Login successful"
        }), 200

    return jsonify({
        "message": "Invalid password"
    }), 401