from selenium import webdriver
from selenium.webdriver.common.by import By
import time

def run_manual_site_check(url):
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')

    driver = webdriver.Chrome(options=options)
    try:
        start = time.time()
        driver.get(url)
        latency = int((time.time() - start) * 1000)
        title = driver.title
        login_found = len(driver.find_elements(By.ID, "login")) > 0

        return {
            "is_up": True,
            "latency_ms": latency,
            "title": title,
            "login_section_found": login_found
        }

    except Exception as e:
        return {
            "is_up": False,
            "error": str(e),
            "latency_ms": None
        }
    finally:
        driver.quit()
