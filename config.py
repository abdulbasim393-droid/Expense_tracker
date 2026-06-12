class Config:
    SQLALCHEMY_DATABASE_URI = "postgresql://postgres:password@localhost/expense_tracker"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = "your-very-strong-secret-key-which-is-32-chars-or-more"