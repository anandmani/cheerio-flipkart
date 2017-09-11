# cheerio-flipkart
Flipkart throttles request from an IP. Using proxies to circumvent. 
Cheerio works on flipkart as flipkrt is server side rendered and works without javascript enabled.

<Still doesn't work for more than 10-20 progessively increasing page numbers from an IP>

endpoints:
 - /scrape 
 
 - /crawl
 Get a list of proxy IPs from google. Hit crawl to see if IP is not blocked by flipkart. Use successful IPs to scrape

