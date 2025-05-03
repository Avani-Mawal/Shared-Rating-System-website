import requests

# Replace with your actual API key
API_KEY = "AIzaSyCAvFrUyQ2xzMgtFC0fznrZF6qLaNoKydY"
SEARCH_QUERY = "2024 book review shorts"
MAX_RESULTS = 10

url = "https://www.googleapis.com/youtube/v3/search"

params = {
    "part": "snippet",
    "q": SEARCH_QUERY,
    "maxResults": MAX_RESULTS,
    "type": "video",
    "key": API_KEY
}

response = requests.get(url, params=params)

if response.status_code == 200:
    data = response.json()
    results = []

    for item in data.get("items", []):
        video_id = item["id"]["videoId"]
        snippet = item["snippet"]
        title = snippet["title"]
        thumbnails = snippet.get("thumbnails", {})
        thumbnail_url = thumbnails.get("high", {}).get("url") or thumbnails.get("default", {}).get("url", "")

        if "shorts" in title.lower():
            video_link = f"https://www.youtube.com/shorts/{video_id}"

            # Escape single quotes in SQL strings
            safe_title = title.replace("'", "''")
            safe_link = video_link.replace("'", "''")
            safe_thumb = thumbnail_url.replace("'", "''")

            sql = f"INSERT INTO Videos (video_link, video_name, thumbnail_url) VALUES ('{safe_link}', '{safe_title}', '{safe_thumb}');"
            results.append(sql)

    with open("shorts_links.txt", "a", encoding="utf-8") as file:
        file.write("\n".join(results) + "\n")

    print(f"✅ Saved {len(results)} entries to shorts_links.txt")
else:
    print("❌ Error:", response.text)
