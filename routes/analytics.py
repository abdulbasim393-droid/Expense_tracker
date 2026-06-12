from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db

from services.analytics_service import (
    get_total_expenses,
    get_category_breakdown,
    get_monthly_trend,
    get_last_30_days,
    get_top_category,
    get_average_daily
)

analytics = Blueprint("analytics", __name__, url_prefix="/analytics")


@analytics.route("/summary", methods=["GET"])
@jwt_required()
def summary():
    user_id = int(get_jwt_identity())

    return jsonify({
        "total_expenses": get_total_expenses(user_id, db),
        "top_category": get_top_category(user_id, db),
        "average_daily": get_average_daily(user_id, db)
    })


@analytics.route("/category", methods=["GET"])
@jwt_required()
def category():
    user_id = int(get_jwt_identity())
    return jsonify(get_category_breakdown(user_id, db))


@analytics.route("/monthly", methods=["GET"])
@jwt_required()
def monthly():
    user_id = int(get_jwt_identity())
    return jsonify(get_monthly_trend(user_id, db))


@analytics.route("/last-30-days", methods=["GET"])
@jwt_required()
def last_30():
    user_id = int(get_jwt_identity())
    return jsonify(get_last_30_days(user_id, db))