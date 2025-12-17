
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
        "participantNumber": request.participantNumber,
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

    # ✅ erst alte Antwort zur selben question_id entfernen (falls Mehrfachklick)
    await tests_collection.update_one(
        {"_id": ObjectId(request.test_id)},
        {"$pull": {"answers": {"question_id": request.question_id}}}
    )

    # ✅ dann neue Antwort speichern
    await tests_collection.update_one(
        {"_id": ObjectId(request.test_id)},
        {"$push": {"answers": entry}}
    )

    return {"status": "ok"}


# FINISH TEST -------------------------------------------------------

@app.post("/finish")
async def finish_test(request: FinishRequest):

    test = await tests_collection.find_one({"_id": ObjectId(request.test_id)})
    if not test:
        return {"status": "error", "message": "test not found"}

    answers = test.get("answers", [])

    # ✅ Score korrekt aus DB
    correct_answers = sum(1 for ans in answers if ans.get("is_correct") is True)

    # ✅ Gesamtzeit korrekt aus DB
    total_time = sum(float(ans.get("time_taken", 0) or 0) for ans in answers)

    await tests_collection.update_one(
        {"_id": ObjectId(request.test_id)},
        {"$set": {"total_time": total_time, "score": correct_answers}}
    )

    return {
        "status": "finished",
        "score": correct_answers,
        "total_time": total_time
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

    test = await tests_collection.find_one({"_id": ObjectId(request.test_id)})
    if test:
        entry["participantNumber"] = test.get("participantNumber")

    # ✅ pro test_id genau 1 Feedback: überschreiben (upsert)
    await feedback_collection.update_one(
        {"test_id": entry["test_id"]},
        {"$set": entry},
        upsert=True
    )

    return {"status": "saved"}


@app.get("/feedback/test/{test_id}")
async def get_feedback_by_test_id(test_id: str):
    doc = await feedback_collection.find_one({"test_id": test_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Kein Feedback gefunden")

    doc["_id"] = str(doc["_id"])
    return {"status": "ok", "feedback": doc}



@app.get("/feedback/{participant_number}")
async def get_feedback(participant_number: str):
    """
    Holt das Feedback eines bestimmten Teilnehmers anhand der participantNumber.
    """
    cursor = feedback_collection.find({"participantNumber": participant_number})
    feedbacks = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        feedbacks.append(doc)

    if not feedbacks:
        return {"status": "error", "message": "Kein Feedback gefunden"}

    return {"status": "ok", "feedback": feedbacks}



# DELETE PARTICIPANT -------------------------------------------------------

@app.delete("/delete/{participant_number}")
async def delete_participant(participant_number: str):
    """
    Löscht alle Testdaten eines Teilnehmenden.
    Spezialfall: participant_number == 'undefined' oder 'null' löscht kaputte Datensätze
    (participantNumber fehlt oder ist null).
    """

    # ✅ Spezialfall: "undefined"/"null" => kaputte Einträge löschen
    if participant_number in {"undefined", "null", "None"}:
        bad_filter = {"$or": [
            {"participantNumber": {"$exists": False}},
            {"participantNumber": None},
        ]}

        # betroffene Test-IDs sammeln (für Feedback-Löschung)
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

    # ✅ normaler Fall: participantNumber = X
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
