from pymongo import MongoClient

MONGO_URL = "mongodb://mongo:27017"
DB_NAME = "minivlat"

client = MongoClient(MONGO_URL)
db = client[DB_NAME]

tests_collection = db["tests"]
feedback_collection = db["feedback"]
