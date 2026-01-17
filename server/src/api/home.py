from fastapi import APIRouter, Response

router = APIRouter()


@router.get("/health")
async def health():
    return {"status": "RUNNING"}


@router.head("/ping")
async def ping():
    return Response(status_code=200)
