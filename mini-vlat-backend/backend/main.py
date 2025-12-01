from fastapi import FastAPI
from bson import ObjectId
from backend.database import tests_collection
from backend.models import (
    StartTestRequest, StartTestResponse,
    AnswerRequest, FinishRequest
)

from backend.database import tests_collection, feedback_collection
from backend.models import FeedbackRequest


from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# START TEST -------------------------------------------------------

@app.post("/start", response_model=StartTestResponse)
async def start_test(request: StartTestRequest):

    new_test = {
        "username": request.username,
        "test_type": request.test_type,
        "answers": [],
        "total_time": None,
        "score": None
    }

    result = await tests_collection.insert_one(new_test)

    return StartTestResponse(test_id=str(result.inserted_id))


# SAVE ANSWER -------------------------------------------------------

@app.post("/answer")
async def save_answer(request: AnswerRequest):

    entry = {
        "question_id": request.question_id,
        "selected_answer": request.selected_answer,
        "correct_answer": request.correct_answer,
        "is_correct": request.is_correct,
        "time_taken": request.time_taken
    }

    await tests_collection.update_one(
        {"_id": ObjectId(request.test_id)},
        {"$push": {"answers": entry}}
    )

    return {"status": "ok"}


# FINISH TEST -------------------------------------------------------

@app.post("/finish")
async def finish_test(request: FinishRequest):

    # Test laden
    test = await tests_collection.find_one({"_id": ObjectId(request.test_id)})

    if not test:
        return {"status": "error", "message": "test not found"}

    # Score korrekt berechnen
    correct_answers = sum(1 for ans in test["answers"] if ans.get("is_correct") is True)

    # DB updaten
    await tests_collection.update_one(
        {"_id": ObjectId(request.test_id)},
        {
            "$set": {
                "total_time": request.total_time,
                "score": correct_answers
            }
        }
    )

    return {
        "status": "finished",
        "score": correct_answers
    }



# GET RESULTS FOR A TEST TYPE ----------------------------------------

@app.get("/results/{test_type}")
async def get_results(test_type: str):

    cursor = tests_collection.find({"test_type": test_type})
    results = []

    async for doc in cursor:
        doc["_id"] = str(doc["_id"])  # Convert ObjectId
        results.append(doc)

    return results

@app.post("/feedback")
async def save_feedback(request: FeedbackRequest):

    entry = request.dict()
    result = await feedback_collection.insert_one(entry)

    return {"status": "saved", "id": str(result.inserted_id)}
