from flask import Flask, render_template, request, jsonify
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver import ChromeOptions
import json
from time import sleep

app = Flask(__name__)


# Set the path to your chromedriver executable
chromedriver_path = '/path/to/chromedriver'

@app.route('/scrape', methods=['POST'])
def scrape():
    if request.method == 'POST':
        user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36"
        #options
        options = ChromeOptions()
        options.add_argument('--headless')
        options.add_argument('--disable-notifications')
        options.add_argument('--enable-logging')
        options.add_argument(f'user-agent={user_agent}')
        url = request.json.get('url')
        browser = webdriver.Chrome(options=options)

        # Initialize Chrome driver  
        try:
            # Navigate to the provided URL
            browser.get(url)
            # print(1)
            # Extract title and any other data you need
            wait = WebDriverWait(browser, 10)
            element1 = wait.until(EC.presence_of_element_located((By.XPATH, "//article[@data-testid='tweet']")))
            tweet =  browser.find_element(By.XPATH, '//article[@data-testid="tweet"]')
            # print(2)
            element = WebDriverWait(browser,10).until(EC.presence_of_element_located((By.CLASS_NAME,'css-9pa8cd')))
            img = tweet.find_element(By.XPATH,'//img[@class="css-9pa8cd"]').get_attribute("src")
            # print(3)
            # print(img,"sujal")
            # print(4)
            # print(5)
            user_name_container = tweet.find_element(By.XPATH, '//a[@class="css-175oi2r r-1wbh5a2 r-dnmrzs r-1ny4l3l r-1loqt21"]')
            # print(6)
            user_name = user_name_container.get_attribute("href")[20:]
            # print(8)
            name_container = tweet.find_elements(By.XPATH, '//span[@class="css-1qaijid r-bcqeeo r-qvutc0 r-poiln3"]')
            name = name_container[6].text
            tweet_body = name_container[9].text
            time = tweet.find_element(By.TAG_NAME, 'time').text
            
            # print(time)
            # print(user_name)
            # Add more scraping logic as needed

            

            # Return the scraped data as JSON
            return jsonify({
                'user_name':user_name,
                'name':name,
                'tweet_body':tweet_body,
                'time':time,
                'img':img     
                })
        except Exception as e:
            # Handle any errors that may occur during scraping
            return jsonify({'error': str(e)})
        finally:
            # Make sure to close the driver even if an exception occurs
            pass

if __name__ == '__main__':
    app.run(debug=True)


'''
user_name =  browser.find_element(By.CLASS_NAME, 'css-1qaijid')


'''