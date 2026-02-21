from scraper import get_article_links, parse_article
from leetcode_scraper import run_leetcode
from db import insert_pyqs

GFG_COMPANIES = [
    "tcs", "infosys", "amazon", "wipro", "google",
    "microsoft", "cognizant", "hcl", "accenture", "flipkart",
    "atlassian", "uber", "visa", "jpmorgan", "natwest",
    "goldmansachs", "deutschebank", "amex"
]

def run_gfg(companies: list[str], max_pages: int = 2):
    for company in companies:
        print(f"\n🔍 GFG — {company.upper()}")
        links = get_article_links(company, max_pages)
        print(f"  Found {len(links)} articles")
        all_questions = []
        for i, link in enumerate(links[:10]):
            print(f"  Parsing {i+1}/{min(len(links), 10)}")
            all_questions.extend(parse_article(link))
        print(f"  Extracted {len(all_questions)} questions")
        insert_pyqs(company, all_questions)

if __name__ == "__main__":
    print("=== GFG Scraper ===")
    '''run_gfg(GFG_COMPANIES)'''
    print("\n=== LeetCode Scraper ===")
    run_leetcode()
    print("\n✅ All done!")