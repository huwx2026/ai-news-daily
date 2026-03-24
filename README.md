# Daily AI News

## Overview
Daily AI News is a project designed to curate and present the latest news articles related to artificial intelligence. The goal is to keep users informed about the latest developments in the AI landscape.

## Setup Instructions
1. **Clone the Repository**  
   To get started, clone the repository to your local machine:
   ```bash
   git clone https://github.com/huwx2026/ai-news-daily.git
   cd ai-news-daily
   ```

2. **Install Dependencies**  
   Make sure you have Python (>= 3.6) installed. Then, install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

3. **API Key**  
   You will need an API key for accessing news articles. Head over to the news API provider, sign up, and obtain your key. Create a `.env` file in the root of the project and add your API key:
   ```text
   NEWS_API_KEY=your_api_key_here
   ```

## Configuration Steps
- Ensure your environment is set up correctly, and all environment variables are configured through the `.env` file.  
- Customize settings in the `config.py` file according to your preferences for filtering news articles.

## Usage Guidelines
To start the application, run:
```bash
python main.py
```
This will begin fetching the latest AI news articles and present them formatted in your console.

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request for any changes or enhancements.