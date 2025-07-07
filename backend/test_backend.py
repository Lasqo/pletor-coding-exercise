import pytest
from httpx import AsyncClient
from main import app
import asyncio

# Helper to get a token for a user
def get_token(client, username, password):
    response = asyncio.run(client.post("/token", data={"username": username, "password": password}))
    return response.json()["access_token"]

@pytest.mark.asyncio
async def test_register_and_login():
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Register a new user
        resp = await client.post("/register", json={"username": "testuser", "password": "testpass"})
        assert resp.status_code == 200
        # Login
        resp = await client.post("/token", data={"username": "testuser", "password": "testpass"})
        assert resp.status_code == 200
        assert "access_token" in resp.json()

@pytest.mark.asyncio
async def test_image_upload_and_quota():
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Register and login
        await client.post("/register", json={"username": "quotauser", "password": "pass"})
        resp = await client.post("/token", data={"username": "quotauser", "password": "pass"})
        token = resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        # Upload up to quota
        for i in range(5):
            resp = await client.post("/images/", json={"title": f"img{i}", "url": "http://x.com/{i}"}, headers=headers)
            assert resp.status_code == 200
        # 6th upload should fail
        resp = await client.post("/images/", json={"title": "img6", "url": "http://x.com/6"}, headers=headers)
        assert resp.status_code == 429
        assert "quota" in resp.json()["detail"]

@pytest.mark.asyncio
async def test_quota_usage():
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Register and login
        await client.post("/register", json={"username": "usageuser", "password": "pass"})
        resp = await client.post("/token", data={"username": "usageuser", "password": "pass"})
        token = resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        # Check quota usage
        resp = await client.get("/quota-usage/", headers=headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "user_daily_quota" in data
        assert "user_used" in data
        assert "global_daily_quota" in data
        assert "global_used" in data 