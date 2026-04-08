import pytest
from httpx import AsyncClient

# Minimal 1x1 PNG (valid image/png)
MINIMAL_PNG = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
    b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01"
    b"\x00\x00\x05\x00\x01\r\n-\xdb\x00\x00\x00\x00IEND\xaeB`\x82"
)


@pytest.mark.asyncio
async def test_user_daily_upload_quota_returns_429(async_client: AsyncClient):
    """After USER_DAILY_UPLOAD_LIMIT uploads in the same UTC day, the next upload is rejected."""
    r = await async_client.post(
        "/auth/register",
        json={"username": "quotatest", "password": "secret12"},
    )
    assert r.status_code == 201, r.text

    r = await async_client.post(
        "/auth/login",
        data={"username": "quotatest", "password": "secret12"},
    )
    assert r.status_code == 200, r.text
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    for i in range(10):
        files = {"file": (f"t{i}.png", MINIMAL_PNG, "image/png")}
        data = {"title": f"img{i}"}
        r = await async_client.post(
            "/images/upload",
            files=files,
            data=data,
            headers=headers,
        )
        assert r.status_code == 200, r.text

    files = {"file": ("over.png", MINIMAL_PNG, "image/png")}
    data = {"title": "over"}
    r = await async_client.post(
        "/images/upload",
        files=files,
        data=data,
        headers=headers,
    )
    assert r.status_code == 429
    body = r.json()
    assert body["detail"]["code"] == "user_daily_limit"
