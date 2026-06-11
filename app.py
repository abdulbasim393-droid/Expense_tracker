from flask import Flask
from config import Config
from routes.auth import auth
from extensions import db, bcrypt

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
bcrypt.init_app(app)

from models.user import User

app.register_blueprint(auth)


@app.route("/")
def home():
    return "Expense Tracker API Running"

with app.app_context():
    db.create_all()
    

if __name__ == "__main__":
    app.run(debug=True)