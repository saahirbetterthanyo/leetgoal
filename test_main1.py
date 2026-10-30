def get_auth_headers(client):
    client.post("/register", json={"username": "testuser", "password": "testpass123"})
    response = client.post(
        "/login",
        data={"username": "testuser", "password": "testpass123"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ---------- PROBLEMS ----------

def test_create_problem_success(client):
    headers = get_auth_headers(client)
    response = client.post(
        "/problems/",
        json={"name": "Two Sum", "difficulty": "Easy", "link": "https://leetcode.com/two-sum", "topic": "Array"},
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Two Sum"
    assert data["review_data"]["easiness"] == 2.5
    assert data["review_data"]["repetition"] == 0


def test_create_problem_duplicate(client):
    headers = get_auth_headers(client)
    client.post(
        "/problems/",
        json={"name": "Two Sum", "difficulty": "Easy", "link": "x", "topic": "Array"},
        headers=headers
    )
    response = client.post(
        "/problems/",
        json={"name": "Two Sum", "difficulty": "Easy", "link": "x", "topic": "Array"},
        headers=headers
    )
    assert response.status_code == 400


def test_get_problem_success(client):
    headers = get_auth_headers(client)
    created = client.post(
        "/problems/",
        json={"name": "Two Sum", "difficulty": "Easy", "link": "x", "topic": "Array"},
        headers=headers
    ).json()
    response = client.get(f"/problems/{created['id']}", headers=headers)
    assert response.status_code == 200
    assert response.json()["name"] == "Two Sum"


def test_get_problem_not_found(client):
    headers = get_auth_headers(client)
    response = client.get("/problems/9999", headers=headers)
    assert response.status_code == 404


def test_get_all_problems(client):
    headers = get_auth_headers(client)
    client.post(
        "/problems/",
        json={"name": "Two Sum", "difficulty": "Easy", "link": "x", "topic": "Array"},
        headers=headers
    )
    response = client.get("/problems/", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_update_problem_success(client):
    headers = get_auth_headers(client)
    created = client.post(
        "/problems/",
        json={"name": "Two Sum", "difficulty": "Easy", "link": "x", "topic": "Array"},
        headers=headers
    ).json()
    response = client.put(
        f"/problems/{created['id']}",
        json={"name": "Two Sum", "difficulty": "Medium", "link": "x", "topic": "Array"},
        headers=headers
    )
    assert response.status_code == 200
    assert response.json()["difficulty"] == "Medium"


def test_update_problem_not_found(client):
    headers = get_auth_headers(client)
    response = client.put(
        "/problems/9999",
        json={"name": "X", "difficulty": "Easy", "link": "x", "topic": "Array"},
        headers=headers
    )
    assert response.status_code == 404


def test_delete_problem_success(client):
    headers = get_auth_headers(client)
    created = client.post(
        "/problems/",
        json={"name": "Two Sum", "difficulty": "Easy", "link": "x", "topic": "Array"},
        headers=headers
    ).json()
    response = client.delete(f"/problems/{created['id']}", headers=headers)
    assert response.status_code == 200
    assert response.json()["message"] == "Problem deleted successfully"


def test_delete_problem_not_found(client):
    headers = get_auth_headers(client)
    response = client.delete("/problems/9999", headers=headers)
    assert response.status_code == 404


# ---------- REVIEW / SM2 ----------

def test_review_card_success(client):
    headers = get_auth_headers(client)
    created = client.post(
        "/problems/",
        json={"name": "Two Sum", "difficulty": "Easy", "link": "x", "topic": "Array"},
        headers=headers
    ).json()
    card_id = created["review_data"]["id"]

    response = client.post(f"/cards/{card_id}/review?quality=5", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["repetition"] == 1
    assert data["interval_days"] == 1


def test_review_card_not_found(client):
    headers = get_auth_headers(client)
    response = client.post("/cards/9999/review?quality=5", headers=headers)
    assert response.status_code == 404


def test_due_cards(client):
    headers = get_auth_headers(client)
    client.post(
        "/problems/",
        json={"name": "Two Sum", "difficulty": "Easy", "link": "x", "topic": "Array"},
        headers=headers
    )
    response = client.get("/cards/due", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) == 1
        
 
