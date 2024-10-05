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

# テストケースの読み込み
def load_test_cases(problem_id: int):
    test_case_file_path = os.path.join(TEST_CASES_DIR, f"{problem_id}.json")

    # テストケースファイルの存在確認
    if not os.path.exists(test_case_file_path):
        raise HTTPException(status_code=404, detail="Test cases not found")

    # テストケースの読み込み
    with open(test_case_file_path, "r") as f:
        test_cases = json.load(f)

    return test_cases

@app.post("/api/submit")
async def submit_code(code_submission: CodeSubmission):
    # コードのサニタイズ
    code = sanitize_code(code_submission.code)

    # テストケースの読み込み
    problem_id = code_submission.problem_id
    try:
        test_cases = load_test_cases(problem_id)
    except HTTPException as e:
        raise e

    # テストケースの実行
    results = []
    all_tests_passed = True
    for i, test_case in enumerate(test_cases):
        input_data = test_case["input"]
        expected_output = test_case["output"]

        # コードの実行
        try:
            exec(code)
            result = eval(f"main({input_data})")
        except Exception as e:
            result = f"Error: {e}"

        # テスト結果の判定
        if result == expected_output:
            status = "AC"
        else:
            status = "WA"

        results.append({
            "test_case": i + 1,
            "status": status,
            "result": result,
            "expected_output": expected_output
        })

    return results







