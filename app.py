from flask import Flask
from config import Config
from routes.auth import auth
from extensions import db, bcrypt
from models.user import User
from routes.expense import expense
from models.expense import Expense


app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
bcrypt.init_app(app)

app.register_blueprint(auth)
app.register_blueprint(expense)



@app.route("/")
def home():
    return "Expense Tracker API Running"

with app.app_context():
    db.create_all()


    

if __name__ == "__main__":
    app.run(debug=True)