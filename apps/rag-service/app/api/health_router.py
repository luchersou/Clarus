from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def check():
    return {"status": "ok"}