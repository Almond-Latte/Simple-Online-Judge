from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import json
import re
import os
import docker


app = FastAPI()
client = docker.from_env()

TEST_CASES_DIR = os.path.join(os.path.dirname(__file__), "test_cases")

@app.get("/")
async def root():
    return {"message": "Hello, FastAPI!"}

class CodeSubmission(BaseModel):
    code: str
    problem_id: int

def sanitize_code(code: str) -> str:
    # import statementの削除
    sanitize_code = re.sub(r'import\s+\w+', '', code)
    # __ を含む特殊属性の使用を禁止
    sanitize_code = re.sub(r'__\w+__', '', sanitize_code)
    # other sanitization
    sanitize_code = re.sub(r'os\.system|eval|exec', '', sanitize_code)

    return sanitize_code

# テストケースの読み込み
def load_test_cases(problem_id: int) -> list[dict[str, str]]:
    test_case_file_path = os.path.join(TEST_CASES_DIR, f"{problem_id}.json")

    # テストケースファイルの存在確認
    if not os.path.exists(test_case_file_path):
        raise HTTPException(status_code=404, detail="Test cases not found")

    # テストケースの読み込み
    with open(test_case_file_path, "r") as f:
        test_cases = json.load(f)

    return test_cases

# サンドボックス環境でコードを実行
def execute_code_in_sandbox(code: str, input_data: str) -> str:
    try:
        script_content = f"""
input_data = "{input_data}"
print(eval("{sanitize_code(code)}"))
"""

        script_path = os.path.join("/tmp", "script.py")
        with open(script_path, "w") as f:
            f.write(script_content)

        container = client.containers.run(
            image="python-sandbox",
            command=["python3", "/sandbox/script.py"],
            volumes={script_path: {"bind": "/sandbox/script.py", "mode": "ro"}},
            working_dir="/sandbox",
            user="sandboxuser",
            detach=True,
            remove=True,
        )

        logs = container.logs().decode("utf-8")
        return logs.strip()
    except Exception as e:
        return str(e)

@app.post("/api/submit")
async def submit_code(code_submission: CodeSubmission):
    # コードのサニタイズ
    sanitized_code: str = sanitize_code(code_submission.code)

    # テストケースの読み込み
    problem_id: str = code_submission.problem_id
    try:
        test_cases = load_test_cases(problem_id)
    except HTTPException as e:
        raise e

    # テストケースの実行
    results: list[dict[str, str]] = []
    all_tests_passed: bool = True

    for test_case in test_cases:
        input_data: str = test_case["input"]
        expected_output: str = test_case["output"]
        try:
            output: str = execute_code_in_sandbox(sanitized_code, input_data)

            passed: bool = output == expected_output
            results.append({
                "input": input_data,
                "expected_output": expected_output,
                "output": output,
                "passed": passed,
            })

            if not passed:
                all_tests_passed = False

        except Exception as e:
            results.append({
                "input": input_data,
                "expected_output": expected_output,
                "output": str(e),
                "passed": False,
            })
            all_tests_passed = False

    return {
        "all_tests_passed": all_tests_passed,
        "results": results,
    }








