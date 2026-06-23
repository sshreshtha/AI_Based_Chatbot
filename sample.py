from config.database import db


print("Connected database:", db.name)
print(db.list_collection_names())
