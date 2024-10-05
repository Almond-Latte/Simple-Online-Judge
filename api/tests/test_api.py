import pytest
from httpx import AsyncClient, ASGITransport
from main import app  # FastAPIのアプリケーションインスタンスをインポート

@pytest.mark.asyncio
async def test_root():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as client:
        response = await client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello, FastAPI!"}


@pytest.mark.asyncio
async def test_submit_code():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as client:
        # テスト用のデータ（送信コードと問題ID）
        payload = {
            "code": "lambda x, y: x + y",
            "problem_id": 1  # 事前に作成したテストケースに合わせる
        }

        # POSTリクエストを送信してレスポンスを取得
        response = await client.post("/api/submit", json=payload)

    # ステータスコードが200であることを確認
    assert response.status_code == 200

    # レスポンスの内容が期待される形式であることを確認
    response_json = response.json()
    assert "all_tests_passed" in response_json
    assert "results" in response_json
    assert isinstance(response_json["all_tests_passed"], bool)
    assert isinstance(response_json["results"], list)
