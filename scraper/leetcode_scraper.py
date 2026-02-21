import requests
import time
from db import insert_pyqs
import re

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "Content-Type": "application/json",
    "Referer": "https://leetcode.com",
}

COMPANY_SLUGS = {
    "amazon": "amazon",
    "google": "google",
    "microsoft": "microsoft",
    "flipkart": "flipkart",
    "uber": "uber",
    "atlassian": "atlassian",
    "visa": "visa",
    "jpmorgan": "jpmorgan",
    "goldmansachs": "goldman-sachs",
}

GRAPHQL_URL = "https://leetcode.com/graphql"

def get_interview_posts(company_slug: str, limit: int = 30) -> list[dict]:
    # Step 1: Get post IDs and titles
    query = """
    query categoryTopicList($categories: [String!]!, $first: Int!, $skip: Int, $tags: [String!]) {
      categoryTopicList(
        categories: $categories
        first: $first
        skip: $skip
        tags: $tags
      ) {
        edges {
          node {
            id
            title
          }
        }
      }
    }
    """

    payload = {
        "query": query,
        "variables": {
            "categories": ["interview-experience"],
            "tags": [company_slug],
            "first": limit,
            "skip": 0,
        }
    }

    try:
        res = requests.post(GRAPHQL_URL, json=payload, headers=HEADERS, timeout=15)
        data = res.json()
        edges = data.get("data", {}).get("categoryTopicList", {}).get("edges", [])
        posts = [e["node"] for e in edges]
        print(f"  Found {len(posts)} posts")

        # Step 2: Fetch content for each post
        full_posts = []
        for post in posts[:10]:
            content = get_post_content(post["id"])
            if content:
                full_posts.append({ **post, "content": content })
            time.sleep(0.5)

        return full_posts
    except Exception as e:
        print(f"  Error: {e}")
        return []


def get_post_content(post_id: str) -> str:
    query = """
    query DiscussTopic($topicId: Int!) {
      topic(id: $topicId) {
        id
        post {
          content
        }
      }
    }
    """
    try:
        res = requests.post(GRAPHQL_URL, json={
            "query": query,
            "variables": { "topicId": int(post_id) }
        }, headers=HEADERS, timeout=10)
        data = res.json()
        print(f"    Debug: {str(data)[:150]}")  # add this
        content = data.get("data", {}).get("topic", {}).get("post", {}).get("content", "")
        return content
    except Exception as e:
        print(f"    Error: {e}")
        return ""


import re

def parse_post(post: dict) -> list[dict]:
    questions = []
    content = post.get("content", "") or ""
    source = f"https://leetcode.com/discuss/{post.get('id', '')}"

    # Clean markdown
    content = re.sub(r'\*\*', '', content)
    content = re.sub(r'\\n', '\n', content)
    content = re.sub(r'<[^>]+>', '', content)

    lines = content.split('\n')

    for line in lines:
        text = line.strip()

        if len(text) < 20 or len(text) > 600:
            continue

        # Prioritize lines starting with Q1, Q2 etc — these are actual questions
        is_question = bool(re.match(r'^Q\d+[\.:)]', text))

        if not is_question:
            # Also catch lines with question keywords
            if not any(kw in text.lower() for kw in [
                "find", "given", "implement", "write", "design",
                "what", "how", "why", "explain", "difference",
                "print", "check", "count", "sort", "search",
                "return", "minimum", "maximum", "tell me", "binary"
            ]):
                continue

        # Clean Q1: Q2: prefix
        text = re.sub(r'^Q\d+[\.:)]\s*', '', text).strip()

        if len(text) < 15:
            continue

        questions.append({
            "question": text,
            "difficulty": classify_difficulty(text),
            "category": classify_category(text),
            "tags": extract_tags(text),
            "source": source,
        })

    return questions


def classify_difficulty(text: str) -> str:
    text_lower = text.lower()
    if any(kw in text_lower for kw in ["hard", "dynamic programming", "dp", "graph", "trie", "segment"]):
        return "Hard"
    if any(kw in text_lower for kw in ["easy", "array", "string", "palindrome", "fibonacci"]):
        return "Easy"
    return "Medium"


def classify_category(text: str) -> str:
    text_lower = text.lower()
    if any(kw in text_lower for kw in ["array", "string", "tree", "graph", "dp", "sort", "linked list", "binary"]):
        return "DSA"
    if any(kw in text_lower for kw in ["profit", "loss", "speed", "percentage", "probability", "puzzle"]):
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


def run_leetcode(max_posts: int = 30):
    for company_key, slug in COMPANY_SLUGS.items():
        print(f"\n🔍 LeetCode — {company_key.upper()}")
        posts = get_interview_posts(slug, limit=max_posts)

        all_questions = []
        for post in posts:
            questions = parse_post(post)
            all_questions.extend(questions)

        print(f"  Extracted {len(all_questions)} questions")
        insert_pyqs(company_key, all_questions)
        time.sleep(2)

    print("\n✅ LeetCode scraping done!")


if __name__ == "__main__":
    run_leetcode()

# if __name__ == "__main__":
#     posts = get_interview_posts("amazon", limit=2)
#     print(posts)