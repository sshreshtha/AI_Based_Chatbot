from config.database import db

db.admins.create_index("email", unique=True)
db.tickets.create_index("ticket_id", unique=True)
db.response_cache.create_index("topic", unique=True)
db.query_analytics.create_index([("query", 1), ("mapped_topic", 1), ("session_id", 1)])
db.topic_aliases.create_index([("topic", 1), ("alias", 1)], unique=True)

print("Indexes created")
