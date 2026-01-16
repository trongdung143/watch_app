from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.api import chat, home

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://127.0.0.1:8080"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["Set-Cookie"],
)

BLOCKED_KEYWORDS = ["wget", "chmod", "rm", ";", "curl", "tftp", "ftpget"]


@app.middleware("http")
async def block_malicious_requests(request: Request, call_next):
    try:
        raw_url = str(request.url)
        if any(
            keyword in raw_url.lower()
            for keyword in ["wget", "curl", "sh ", "rm ", "chmod"]
        ):
            return JSONResponse(
                status_code=403,
                content={"detail": "blocked request due to security policy."},
            )
        response = await call_next(request)
        return response
    except Exception:
        return JSONResponse(
            status_code=500, content={"detail": "Internal server error."}
        )


app.include_router(chat.router)
app.include_router(home.router)
