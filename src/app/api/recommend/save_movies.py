import pandas as pd
from pymongo import MongoClient

# Step 1: Load the dataset
movies = pd.read_csv("https://s3-us-west-2.amazonaws.com/recommender-tutorial/movies.csv")
print(movies.head())

# Step 2: Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["Popreel"]
collection = db["videos"]

# Step 3: Convert DataFrame to a list of dictionaries
movie_records = movies.to_dict("records")

# Step 4: Insert data into MongoDB
collection.insert_many(movie_records)
print("Data inserted successfully!")

# Step 5: Verify the data
for record in collection.find().limit(5):
    print(record)
