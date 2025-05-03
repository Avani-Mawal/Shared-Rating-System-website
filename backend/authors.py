import requests
from bs4 import BeautifulSoup
import re
import time
import urllib.parse
import random
import backoff
import requests_cache

# Install cache — auto caches GET responses for 24 hours
requests_cache.install_cache('goodreads_cache', expire_after=86400)

# List of User-Agents to rotate between
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:98.0)",
]

# Session object to persist connections and headers
session = requests.Session()

def set_random_headers():
    session.headers.update({
        "User-Agent": random.choice(USER_AGENTS)
    })

# Retry failed requests with exponential backoff
@backoff.on_exception(backoff.expo, requests.exceptions.RequestException, max_time=60)
def fetch_url(url):
    set_random_headers()
    res = session.get(url, timeout=10)
    res.raise_for_status()
    return res

def extract_authors_from_file(filename):
    authors = []
    with open(filename, 'r', encoding='utf-8') as file:
        for line in file:
            match = re.search(r"VALUES\s*\(\s*'(.+?)'\s*\);", line)
            if match:
                authors.append(match.group(1))
    return authors

def find_author_link_from_search(author_name):
    query = urllib.parse.quote(author_name)
    url = f"https://www.goodreads.com/search?q={query}"

    try:
        res = fetch_url(url)
        soup = BeautifulSoup(res.text, "html.parser")

        link = soup.select_one("a[href*='/author/show/']")
        if link:
            href = link["href"]
            return href if href.startswith("http") else "https://www.goodreads.com" + href

        return None
    except Exception as e:
        print(f"❌ Error finding link for {author_name}: {e}")
        return None

def get_author_details(author_url):
    try:
        res = fetch_url(author_url)
        soup = BeautifulSoup(res.text, "html.parser")

        # Get image URL
        img_tag = soup.select_one("img.authorLargeImg, img[itemprop='image']")
        image_url = img_tag["src"] if img_tag and img_tag.has_attr("src") else ""
        if 'nophoto' in image_url.lower():
            image_url = ""

        # Get description
        desc_tag = soup.select_one("div.aboutAuthorInfo span.readable span")
        if not desc_tag:
            desc_tag = soup.select_one("div.aboutAuthorInfo")

        bio = desc_tag.get_text(separator="\n", strip=True) if desc_tag else ""

        return image_url, bio

    except Exception as e:
        print(f"❌ Error fetching details for {author_url}: {e}")
        return "", ""

def escape_sql(s):
    return s.replace("'", "''")

def main():
    input_file = "../schema/authors.sql"
    output_file = "authors_details.sql"

    authors = extract_authors_from_file(input_file)
    print(f"📘 Found {len(authors)} authors")

    with open(output_file, 'w', encoding='utf-8') as out:
        for idx, author in enumerate(authors):
            print(f"\n🔍 Searching: {author}")
            url = find_author_link_from_search(author)
            if not url:
                print(f"❌ Author not found: {author}")
                continue

            image_url, description = get_author_details(url)
            if not image_url:
                print(f"⚠️ No image for {author}")

            sql = (
                f"INSERT INTO author_details (name, image_link, bio) VALUES ("
                f"'{escape_sql(author)}', '{escape_sql(image_url)}', '{escape_sql(description)}');\n"
            )
            out.write(sql)
            print(f"✅ Added: {author}")

            # Rate limiting: 1 sec sleep every 3 requests
            if idx % 3 == 0:
                time.sleep(1)

if __name__ == "__main__":
    main()
