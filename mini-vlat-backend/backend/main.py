
from fastapi import FastAPI, HTTPException
from bson import ObjectId
from backend.database import tests_collection
from backend.models import (
    StartTestRequest, StartTestResponse,
    AnswerRequest, FinishRequest
)

from backend.database import tests_collection, feedback_collection
from backend.models import FeedbackRequest


from fastapi.middleware.cors import CORSMiddleware

# =====================================================
# FASTAPI APPLICATION SETUP
# =====================================================

app = FastAPI()

# Enable CORS to allow communication with the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],     # Allow all origins (development & study deployment)
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================
# START TEST
# Creates a new test session for a participant
# =====================================================

@app.post("/start", response_model=StartTestResponse)
async def start_test(request: StartTestRequest):
    """
    Initializes a new test session.
    Stores participant number and test type, but no answers yet.
    """
     
    new_test = {
        "participantNumber": request.participantNumber,
        "test_type": request.test_type,
        "answers": [],
        "total_time": None,
        "score": None
    }

    result = await tests_collection.insert_one(new_test)

    return StartTestResponse(test_id=str(result.inserted_id))


# =====================================================
# SAVE ANSWER
# Stores or updates an answer for a specific question
# =====================================================

@app.post("/answer")
async def save_answer(request: AnswerRequest):
    """
    Saves a single answer for a given test and question.
    If the same question is answered multiple times,
    the previous answer is overwritten.
    """ 

    entry = {
        "question_id": request.question_id,
        "selected_answer": request.selected_answer,
        "correct_answer": request.correct_answer,
        "is_correct": request.is_correct,
        "time_taken": request.time_taken
    }

    # Remove any existing answer for the same question
    # (prevents duplicates due to multiple clicks)
    await tests_collection.update_one(
        {"_id": ObjectId(request.test_id)},
        {"$pull": {"answers": {"question_id": request.question_id}}}
    )

    # Store the new answer
    await tests_collection.update_one(
        {"_id": ObjectId(request.test_id)},
        {"$push": {"answers": entry}}
    )

    return {"status": "ok"}


# =====================================================
# FINISH TEST
# Computes final score and total time from stored answers
# =====================================================

@app.post("/finish")
async def finish_test(request: FinishRequest):
    """
    Finalizes a test session.
    Calculates score and total completion time based on
    all stored answers in the database.
    """

    test = await tests_collection.find_one({"_id": ObjectId(request.test_id)})
    if not test:
        return {"status": "error", "message": "test not found"}

    answers = test.get("answers", [])

    # Calculate score based on correctness stored in DB
    correct_answers = sum(1 for ans in answers if ans.get("is_correct") is True)

    # Calculate total time as the sum of per-question times
    total_time = sum(float(ans.get("time_taken", 0) or 0) for ans in answers)

    # Store final results in the test document
    await tests_collection.update_one(
        {"_id": ObjectId(request.test_id)},
        {"$set": {"total_time": total_time, "score": correct_answers}}
    )

    return {
        "status": "finished",
        "score": correct_answers,
        "total_time": total_time
    }



# =====================================================
# GET RESULTS BY TEST TYPE
# Used for analysis and result overview
# =====================================================

@app.get("/results/{test_type}")
async def get_results(test_type: str):
    """
    Returns all test records for a given test type
    (e.g., Test A, B, or C).
    """

    cursor = tests_collection.find({"test_type": test_type})
    results = []

    async for doc in cursor:
        doc["_id"] = str(doc["_id"])  # Convert ObjectId for JSON
        results.append(doc)

    return results

# =====================================================
# SAVE FEEDBACK
# Stores post-test questionnaire responses
# =====================================================

@app.post("/feedback")
async def save_feedback(request: FeedbackRequest):
    """
    Saves feedback for a test session.
    Each test_id can have exactly one feedback entry.
    Existing feedback is overwritten (upsert).
    """ 
    
    entry = request.dict()

    # Attach participant number from test document if available
    test = await tests_collection.find_one({"_id": ObjectId(request.test_id)})
    if test:
        entry["participantNumber"] = test.get("participantNumber")

    # Ensure exactly one feedback entry per test_id
    await feedback_collection.update_one(
        {"test_id": entry["test_id"]},
        {"$set": entry},
        upsert=True
    )

    return {"status": "saved"}

# =====================================================
# GET FEEDBACK BY TEST ID
# =====================================================


@app.get("/feedback/test/{test_id}")
async def get_feedback_by_test_id(test_id: str):
    """
    Retrieves the feedback associated with a specific test ID.
    """
    
    doc = await feedback_collection.find_one({"test_id": test_id})
    if not doc:
        return {"status": "empty", "feedback": None}

    doc["_id"] = str(doc["_id"])
    return {"status": "ok", "feedback": doc}

# =====================================================
# GET FEEDBACK BY PARTICIPANT NUMBER
# =====================================================

@app.get("/feedback/{participant_number}")
async def get_feedback(participant_number: str):
    """
    Retrieves all feedback entries associated with
    a specific participant number.
    """

    cursor = feedback_collection.find({"participantNumber": participant_number})
    feedbacks = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        feedbacks.append(doc)

    if not feedbacks:
        return {"status": "error", "message": "Kein Feedback gefunden"}

    return {"status": "ok", "feedback": feedbacks}



# =====================================================
# DELETE PARTICIPANT DATA
# Removes all test and feedback data of a participant
# =====================================================

@app.delete("/delete/{participant_number}")
async def delete_participant(participant_number: str):
    """
    Deletes all test and feedback data for a participant.

    Special case:
    participant_number == 'undefined', 'null', or 'None'
    removes corrupted entries where participantNumber
    is missing or null.
    """

     # Special case: delete corrupted records
    if participant_number in {"undefined", "null", "None"}:
        bad_filter = {"$or": [
            {"participantNumber": {"$exists": False}},
            {"participantNumber": None},
        ]}

        # Collect affected test IDs for feedback cleanup
        bad_tests = []
        async for doc in tests_collection.find(bad_filter, {"_id": 1}):
            bad_tests.append(str(doc["_id"]))

        delete_tests = await tests_collection.delete_many(bad_filter)

        delete_feedback = await feedback_collection.delete_many({
            "test_id": {"$in": bad_tests}
        })

        return {
            "status": "deleted",
            "participantNumber": participant_number,
            "deleted_tests": delete_tests.deleted_count,
            "deleted_feedback": delete_feedback.deleted_count
        }

    # Normal case: delete by participant number
    tests_filter = {"participantNumber": participant_number}

    test_ids = []
    async for doc in tests_collection.find(tests_filter, {"_id": 1}):
        test_ids.append(str(doc["_id"]))

    delete_tests = await tests_collection.delete_many(tests_filter)

    delete_feedback = await feedback_collection.delete_many({
        "test_id": {"$in": test_ids}
    })

    if delete_tests.deleted_count == 0 and delete_feedback.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Teilnehmer nicht gefunden")

    return {
        "status": "deleted",
        "participantNumber": participant_number,
        "deleted_tests": delete_tests.deleted_count,
        "deleted_feedback": delete_feedback.deleted_count
    }

# =====================================================
# UPDATE PARTICIPANT NAME
# =====================================================

@app.patch("/participant/{test_id}")
async def update_participant_name(test_id: str, participantNumber: str):
    """
    Updates the participantNumber for a given test.
    """

    result = await tests_collection.update_one(
        {"_id": ObjectId(test_id)},
        {"$set": {"participantNumber": participantNumber}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Test nicht gefunden")

    return {"status": "updated", "participantNumber": participantNumber}
