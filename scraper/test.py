import requests
from bs4 import BeautifulSoup

headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}

url = "https://www.geeksforgeeks.org/tag/tcs/"
res = requests.get(url, headers=headers, timeout=10)
print("Status:", res.status_code)

soup = BeautifulSoup(res.text, "html.parser")
links = [a.get("href") for a in soup.find_all("a", href=True) if "interview" in a.get("href", "").lower()]
print(f"Found {len(links)} interview links")
for l in links[:10]:
    print(l)