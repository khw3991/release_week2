from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app=FastAPI()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Guess(BaseModel):
    guess: str
game_store = {
    "target_number": ""
}

@app.get("/api/target")
def get_target():
    target_number = game_store.get("target_number")
    return {"target_number": target_number}

@app.post("/api/target")
def set_target():
    target_number = new_target()
    return {"target_number": target_number}

def new_target():
    import random
    digits = list(range(10))
    random.shuffle(digits)
    target_number = ''.join(str(digit) for digit in digits[:4])
    game_store["target_number"] = target_number
    return target_number

new_target() #initialize

@app.post("/api/check_guess")
def check_guess(req: Guess):
    target_number = game_store.get("target_number")
    strikes = sum(1 for g, t in zip(req.guess, target_number) if g==t)
    balls = sum(1 for g in req.guess if g in target_number) - strikes
    return {"strikes" : strikes, "balls" : balls}