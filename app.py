from flask import Flask
from config import Config
from routes.auth import auth
from extensions import db, bcrypt, migrate
from models.user import User
from routes.expense import expense
from models.expense import Expense
from flask_jwt_extended import JWTManager
from routes.analytics import analytics
from flask import render_template


app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
bcrypt.init_app(app)
migrate.init_app(app, db)

app.register_blueprint(auth)
app.register_blueprint(expense)
app.register_blueprint(analytics)
jwt = JWTManager(app)





@app.route("/")
@app.route("/login")
def login_page():
    return render_template("login.html")

@app.route("/register")
def register_page():
    return render_template("register.html")

@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")

@app.route("/add")
def add():
    return render_template("add_expense.html")

with app.app_context():

    db.create_all()


    

if __name__ == "__main__":
    app.run(debug=True)

