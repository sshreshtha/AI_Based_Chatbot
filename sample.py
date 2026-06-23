from pymongo import MongoClient

client = MongoClient("mongodb+srv://shreshtha_ss:dbShreshtha@cluster0.lmsvkjd.mongodb.net/?appName=Cluster0")

db = client["ai_chatbot_db"]

print(db.list_collection_names())

for collection in db.list_collection_names():
    print(
        collection,
        db[collection].count_documents({})
    )