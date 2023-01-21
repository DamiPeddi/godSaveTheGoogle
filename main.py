import time
import json
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from fastapi import FastAPI, HTTPException
from typing import Union
import uvicorn
from pydantic import BaseModel

class AutocompleteRequest(BaseModel):
    prompt: str
    countries: Union[list, None] = []
    lang: Union[str, None] = "en"

    class Config:
        orm_mode = True

class FormattedAddressRequest(BaseModel):
    prompt: str
    countries: Union[list, None] = []

    class Config:
        orm_mode = True

app = FastAPI()
driver = None


def setup_selenium():
    global driver
    options = Options()
    options.headless = True
    #options.add_argument("--window-size=600,800")
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

    driver.get("https://geo-devrel-javascript-samples.web.app/404.html")

    with open("script.js", "r") as f:
        script_content = f.read()
        driver.execute_script(f"""
            var newScript = document.createElement("script"); 
            var inlineScript = document.createTextNode(arguments[0]); 
            newScript.appendChild(inlineScript);  
            document.head.appendChild(newScript);
            """, script_content)
    WebDriverWait(driver, 100).until(
        EC.visibility_of_element_located((By.ID, "status-positive"))).click()

    print("🧨 GOD SAVE THE GOOGLE 🧨")


@app.get("/autocomplete")
def autocomplete(request: AutocompleteRequest):

    if (len(request.prompt) == 0):
        raise HTTPException(status_code=400, detail="Bad request: MISSING PROMPT in body params")

    request_id = driver.execute_script(f"""
        return get_autocomplete_results(arguments[0], arguments[1], arguments[2])
    """, request.prompt, request.countries, request.lang)

    response = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.ID, request_id))).get_attribute("value")

    driver.execute_script(f"""
        return clear_response(arguments[0])
    """, request_id)

    response_data = json.loads(response)

    return response_data

@app.get("/formattedaddress")
def formatted_addresses(request: FormattedAddressRequest):
    if (len(request.prompt) == 0):
        raise HTTPException(status_code=400, detail="Bad request: MISSING PROMPT in body params")

    request_id = driver.execute_script(f"""
        return get_formatted_address_results(arguments[0], arguments[1])
    """, request.prompt, request.countries)

    response = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.ID, request_id))).get_attribute("value")

    driver.execute_script(f"""
        return clear_response(arguments[0])
    """, request_id)

    response_data = json.loads(response)

    return response_data


if __name__ == "__main__":
    setup_selenium()
    uvicorn.run(app, host="0.0.0.0", port=3000)
