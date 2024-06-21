import bs4
import requests
import time
import psycopg2

conn = psycopg2.connect(
        dbname="weather",
        user="postgres",
        password="1234",
        host="localhost",
        port="5432"
    )

count = 0

while True:
    cursor = conn.cursor()
    array = []
    data = requests.get('https://weather.com/en-AG/weather/today/l/a7e52a1f5fcc0ea81a814adf0f7290b436448643d676fb8402477e1105314c57')
    soup = bs4.BeautifulSoup(data.text, 'html.parser')
    status = soup.find('div',{'class': "CurrentConditions--secondary--32-kp"}).find('title').text
    array.append(soup.find('div',{'class': "CurrentConditions--primary--2DOqs"}).find('span').text.replace('°',''))
    rain = soup.find('div',{'class': "HourlyWeatherCard--TableWrapper--1OobO"}).find('li',{'class':'Column--column--3tAuz Column--active--27U5T Column--verticalStack--28b4K'}).find('div',{'data-testid':'SegmentPrecipPercentage'}).find('span').text.replace('Chance of Rain','').replace('%','')

    for i in soup.find_all('div', {'class':'ListItem--listItem--25ojW WeatherDetailsListItem--WeatherDetailsListItem--1CnRC'}):
        if count == 7:
            break
        elif count == 5:
            array.append((i.find('div', {'data-testid':'wxData'}).find('span').text))
        elif count != 0:
            array.append((i.find('div', {'data-testid':'wxData'}).find('span').text)
                        .replace('Wind Direction', '').replace('Arrow Down', '')
                        .replace('\xa0',' ').replace('%',' ').replace('°',' ')
                        .split(' ')[0])
        count += 1
    count = 0
    data = requests.get('https://weather.com/th-TH/forecast/air-quality/l/a7e52a1f5fcc0ea81a814adf0f7290b436448643d676fb8402477e1105314c57')
    soup = bs4.BeautifulSoup(data.text, 'html.parser')
    for i in soup.find_all('div',{'class':'AirQualityText--AirQuality--UALR6'}):
           for j in i.find_all('span'):
            if count != 0 and count%2 == 0:
                array.append(j.text.split(' ')[0])
                count += 1
            else:
                count += 1
    count = 0
    temp = array[0]
    wind = array[1]
    humidity = array[2]
    dew_point = array[3]
    pressure = array[4]
    uv_index = array[5]
    visibility = array[6]
    pm2_5 = array[7]
    co = array[8]
    no2 = array[9]
    o3 = array[10]
    pm10 = array[11]
    so2 = array[12]

    cursor.execute("INSERT INTO weather (temp, humidity, pressure, wind, uv_index, visibility, dew_point, \"createdDate\") VALUES (%s, %s, %s, %s, %s, %s, %s, LOCALTIMESTAMP)", (temp, humidity, pressure, wind, uv_index, visibility, dew_point,))
    cursor.execute("INSERT INTO rain (rain, status, \"createdDate\") VALUES (%s, %s, LOCALTIMESTAMP)", (rain, status,))
    cursor.execute("INSERT INTO healthy (pm2_5, co, no2, o3, pm10, so2, \"createdDate\") VALUES (%s, %s, %s, %s, %s, %s, LOCALTIMESTAMP)", (pm2_5, co, no2, o3, pm10, so2,))
    conn.commit()
    cursor.close()
    print('Web Scraping...')
    time.sleep(60*5)
