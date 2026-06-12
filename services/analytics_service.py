from sqlalchemy import func
from models.expense import Expense
from datetime import datetime, timedelta


def get_total_expenses(user_id, db):
    total = db.session.query(
        func.sum(Expense.amount)
    ).filter_by(user_id=user_id).scalar()

    return total or 0


def get_category_breakdown(user_id, db):
    result = db.session.query(
        Expense.category,
        func.sum(Expense.amount)
    ).filter_by(user_id=user_id)\
     .group_by(Expense.category).all()

    return [
        {"category": category, "total": total}
        for category, total in result
    ]


def get_monthly_trend(user_id, db):
    result = db.session.query(
        func.date_trunc('month', Expense.created_at),
        func.sum(Expense.amount)
    ).filter_by(user_id=user_id)\
     .group_by(func.date_trunc('month', Expense.created_at))\
     .order_by(func.date_trunc('month', Expense.created_at)).all()

    return [
        {"month": str(month.date()), "total": total}
        for month, total in result
    ]


def get_last_30_days(user_id, db):
    start_date = datetime.utcnow() - timedelta(days=30)

    result = db.session.query(
        func.date(Expense.created_at),
        func.sum(Expense.amount)
    ).filter(
        Expense.user_id == user_id,
        Expense.created_at >= start_date
    ).group_by(func.date(Expense.created_at))\
     .order_by(func.date(Expense.created_at)).all()

    return [
        {"date": str(date), "total": total}
        for date, total in result
    ]


def get_top_category(user_id, db):
    result = db.session.query(
        Expense.category,
        func.sum(Expense.amount).label("total")
    ).filter_by(user_id=user_id)\
     .group_by(Expense.category)\
     .order_by(func.sum(Expense.amount).desc())\
     .first()

    if not result:
        return None

    return {"category": result.category, "total": result.total}


def get_average_daily(user_id, db):
    result = db.session.query(
        func.date(Expense.created_at),
        func.sum(Expense.amount)
    ).filter_by(user_id=user_id)\
     .group_by(func.date(Expense.created_at)).all()

    if not result:
        return 0

    total_days = len(result)
    total_spent = sum([r[1] for r in result])

    return total_spent / total_days