from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import json
import re
import os


app = FastAPI()

TEST_CASES_DIR = os.path.join(os.path.dirname(__file__), "test_cases")

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

def load_test_cases(problem_id: int):
    test_case_file_path = os.path.join(TEST_CASES_DIR, f"{problem_id}.json")

    # テストケースファイルの存在確認
    if not os.path.exists(test_case_file_path):
        raise HTTPException(status_code=404, detail="Test cases not found")

    # テストケースの読み込み
    with open(test_case_file_path, "r") as f:
        test_cases = json.load(f)

    return test_cases







