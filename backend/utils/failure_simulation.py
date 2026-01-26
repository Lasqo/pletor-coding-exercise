import random

from fastapi import HTTPException

from config import FAILURE_RATE


def maybe_fail():
    if random.random() < FAILURE_RATE:
        raise HTTPException(status_code=503, detail="Service temporarily unavailable. Please try again.")
