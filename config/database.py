from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

client = MongoClient(os.getenv("MONGODB_URI"))

db = client[os.getenv("MONGODB_DATABASE", os.getenv("MONGO_DB", "ai_chatbot"))]
