from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello, FastAPI!"}

class CodeSubmission(BaseModel):
    code: str
    problem_id: int

def sanitize_code(code: str) -> str:
    # import statementの削除
    sanitize_code = re.sub(r'import\s+\w+', '', code')
    # __ を含む特殊属性の使用を禁止
    sanitize_code = re.sub(r'__\w+__', '', sanitize_code)
    # other sanitization
    sanitize_code = re.sub(r'os\.system|eval|exec', '', sanitize_code)

    return sanitize_code



