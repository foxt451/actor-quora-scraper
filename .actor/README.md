*NOTE: This scraper will likely not work with residential proxies. You should select Apify's automatic proxy (or any other proxy as long as you tested it).*

# What does Quora Scraper do?

Quora Scraper lets you scrape questions found with [Quora's](https://www.quora.com/) search and answers for each of them. The result will include basic information for each question and answer, including their contents, urls etc. You can use this scraper as an unofficial Quora API.

# Why scrape Quora?

Quora is one of the biggest knowledge bases on the Internet. Naturally, there are lots of ways to utilize the information this scraper would provide.

For example, you can simply use it to quickly search for answers you are interested in and store them for future reference. Or, you can use the acquired knowledge for business research in a particular domain area or feed the data to your academic machine learning projects.

If you feel that this scraper is missing some functionality, feel free to contact support

# How much will it cost to scrape Quora?

Cost usage depends on the type of proxy you use and the number of questions and answers that are scraped. For example, using Apify's automatic proxy (United states) the scraper was able to parse 698 questions with their answers using $0.131. Therefore, with Apify's $5 free usage, you'd be able to parse 5 / 0.131 * 698 = ~26 000 questions.

# How to scrape Quora?

1. Go to [Quora Scraper](https://apify.com/svpetrenko/quora-scraper) on Apify
2. Click **Try for free** button
3. Enter scraper Input (see below): search query and proxy configuration. Using Apify's automatic proxy will be good.
4. Click the Start button
5. When the run has finished, you'll see the table of questions in the **default dataset**, which you can export in any format you'd like. You'll see the answers for each question in the **default key-value store**.

# Is it legal to scrape Quora?

Our scrapers are ethical and do not extract any private user data, such as email addresses, gender, or location. They only extract what the user has chosen to share publicly. We therefore believe that our scrapers, when used for ethical purposes by Apify users, are safe. However, you should be aware that your results could contain personal data. Personal data is protected by the [GDPR](https://en.wikipedia.org/wiki/General_Data_Protection_Regulation) in the European Union and by other regulations around the world. You should not scrape personal data unless you have a legitimate reason to do so. If you're unsure whether your reason is legitimate, consult your lawyers. You can also read our blog post on the [legality of web scraping](https://blog.apify.com/is-web-scraping-legal/).

# Input

Quora Scraper has some required input options: search query (the scraper will use it to find questions and their answers) and proxy configuration (without using proxy, many requests might get blocked, so be sure to select some; *NOTE: residential proxy will likely not work with this scraper*). Click on the [Input tab](https://apify.com/svpetrenko/quora-scraper/input-schema) for more information.

# Output

Quora Scraper will add questions to the **default dataset**. You can download the dataset in various formats such as JSON, HTML, CSV, or Excel. For each question, in the **default Key-Value store** there will be an entry with the key of this format: `qid_123456_answers`, where `123456` will be replaced by the actual `qid` of the question (one of the fields extracted by the scraper).
