class Config:
    SQLALCHEMY_DATABASE_URI = \
        "postgresql://postgres:password@localhost/expense_tracker"

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SECRET_KEY = "super-secret-key"         