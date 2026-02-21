import requests
from bs4 import BeautifulSoup
import time

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

COMPANY_URLS = {
    "tcs": "https://www.geeksforgeeks.org/tag/tcs/",
    "infosys": "https://www.geeksforgeeks.org/tag/infosys/",
    "amazon": "https://www.geeksforgeeks.org/tag/amazon/",
    "wipro": "https://www.geeksforgeeks.org/tag/wipro/",
    "google": "https://www.geeksforgeeks.org/tag/google/",
    "microsoft": "https://www.geeksforgeeks.org/tag/microsoft/",
    "cognizant": "https://www.geeksforgeeks.org/tag/cognizant/",
    "hcl": "https://www.geeksforgeeks.org/tag/hcl/",
    "accenture": "https://www.geeksforgeeks.org/tag/accenture/",
    "flipkart": "https://www.geeksforgeeks.org/tag/flipkart/",
    "atlassian": "https://www.geeksforgeeks.org/tag/atlassian/",
    "uber": "https://www.geeksforgeeks.org/tag/uber/",
    "visa": "https://www.geeksforgeeks.org/tag/visa/",
    "jpmorgan": "https://www.geeksforgeeks.org/tag/jp-morgan/",
    "natwest": "https://www.geeksforgeeks.org/tag/natwest/",
    "goldmansachs": "https://www.geeksforgeeks.org/tag/goldman-sachs/",
    "deutschebank": "https://www.geeksforgeeks.org/tag/deutsche-bank/",
    "amex": "https://www.geeksforgeeks.org/tag/american-express/",
    }


def get_article_links(company: str, max_pages: int = 3) -> list[str]:
    links = []
    base_url = COMPANY_URLS.get(company)
    if not base_url:
        return links

    for page in range(1, max_pages + 1):
        url = f"{base_url}page/{page}/"
        try:
            res = requests.get(url, headers=HEADERS, timeout=10)
            soup = BeautifulSoup(res.text, "html.parser")

            # Get all interview experience article links
            all_links = soup.find_all("a", href=True)
            for a in all_links:
                href = a.get("href", "")
                if (
                    "geeksforgeeks.org/interview-experiences/" in href
                    and href not in links
                ):
                    links.append(href)

            # Remove duplicates
            links = list(dict.fromkeys(links))
            print(f"  Page {page}: found {len(links)} articles so far")
            time.sleep(1)

        except Exception as e:
            print(f"  Error fetching page {page}: {e}")

    return links
def parse_article(url: str) -> list[dict]:
    questions = []
    try:
        res = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(res.text, "html.parser")

        # Try multiple content selectors
        content = (
            soup.select_one("div.article-page-main") or
            soup.select_one("div.entry-content") or
            soup.select_one("article") or
            soup.select_one("div.text")
        )
        if not content:
            return questions

        items = content.select("li, p")
        for item in items:
            text = item.get_text(strip=True)
            if len(text) < 20 or len(text) > 500:
                continue
            if not any(kw in text.lower() for kw in [
                "find", "given", "implement", "write", "design",
                "what", "how", "why", "explain", "difference",
                "print", "check", "count", "sort", "search"
            ]):
                continue

            questions.append({
                "question": text,
                "difficulty": classify_difficulty(text),
                "category": classify_category(text),
                "tags": extract_tags(text),
                "source": url,
            })

        time.sleep(0.5)
    except Exception as e:
        print(f"  Error parsing {url}: {e}")
    return questions


def classify_difficulty(text: str) -> str:
    text_lower = text.lower()
    hard_kw = ["dynamic programming", "dp", "graph", "lru", "trie", "segment tree", "dijkstra"]
    easy_kw = ["array", "string", "loop", "factorial", "fibonacci", "reverse", "palindrome"]
    if any(kw in text_lower for kw in hard_kw):
        return "Hard"
    if any(kw in text_lower for kw in easy_kw):
        return "Easy"
    return "Medium"


def classify_category(text: str) -> str:
    text_lower = text.lower()
    if any(kw in text_lower for kw in ["array", "string", "tree", "graph", "dp", "sort", "linked list"]):
        return "DSA"
    if any(kw in text_lower for kw in ["profit", "loss", "speed", "time", "percentage", "probability"]):
        return "Aptitude"
    if any(kw in text_lower for kw in ["tell me", "yourself", "strength", "weakness", "team", "conflict"]):
        return "HR"
    return "Technical"


def extract_tags(text: str) -> list[str]:
    tags = []
    tag_map = {
        "Array": ["array", "subarray"],
        "String": ["string", "substring", "palindrome"],
        "Tree": ["tree", "bst", "binary tree"],
        "Graph": ["graph", "bfs", "dfs"],
        "DP": ["dynamic programming", " dp "],
        "Sorting": ["sort", "quicksort", "mergesort"],
        "OS": ["process", "thread", "deadlock"],
        "DBMS": ["sql", "database", "query"],
        "OOP": ["class", "object", "inheritance"],
    }
    text_lower = text.lower()
    for tag, keywords in tag_map.items():
        if any(kw in text_lower for kw in keywords):
            tags.append(tag)
    return tags