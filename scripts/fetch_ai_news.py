import requests
import os
from datetime import datetime, timedelta
import json

def fetch_ai_news():
    """从 NewsAPI 获取 AI 相关新闻"""
    api_key = os.getenv('NEWSAPI_KEY')
    
    if not api_key:
        print("Error: NEWSAPI_KEY not set")
        return []
    
    # 获取过去24小时的新闻
    yesterday = (datetime.utcnow() - timedelta(days=1)).strftime('%Y-%m-%d')
    
    # 搜索关键词
    keywords = ['artificial intelligence', 'AI', 'machine learning', 'deep learning', 'neural network']
    
    all_articles = []
    
    for keyword in keywords:
        url = "https://newsapi.org/v2/everything"
        params = {
            'q': keyword,
            'from': yesterday,
            'sortBy': 'publishedAt',
            'language': 'en',
            'apiKey': api_key
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            if data['status'] == 'ok':
                all_articles.extend(data['articles'][:3])  # 每个关键词取前3条
            else:
                print(f"API Error: {data.get('message')}")
        except Exception as e:
            print(f"Error fetching news for '{keyword}': {e}")
    
    # 去重
    unique_articles = []
    seen_titles = set()
    for article in all_articles:
        if article['title'] not in seen_titles:
            unique_articles.append(article)
            seen_titles.add(article['title'])
    
    return unique_articles[:10]  # 最多返回10条

def send_to_server_chan(articles):
    """发送新闻摘要到 Server 酱（推送到微信）"""
    sendkey = os.getenv('SERVER_CHAN_SENDKEY')
    
    if not sendkey:
        print("Error: SERVER_CHAN_SENDKEY not set")
        return
    
    # 构建消息标题
    title = f"🤖 全球AI新闻日报 ({datetime.now().strftime('%Y-%m-%d')})"
    
    # 构建消息内容
    desp = "# 📰 今日AI资讯\n\n"
    
    if not articles:
        desp += "暂无新闻"
    else:
        for i, article in enumerate(articles, 1):
            desp += f"## {i}. {article['title']}\n\n"
            desp += f"**来源**: {article['source']['name']}  \n"
            if article['description']:
                desp += f"**摘要**: {article['description']}\n\n"
            desp += f"**发布时间**: {article['publishedAt'][:10]}  \n"
            desp += f"[📖 阅读原文]({article['url']})\n\n"
            desp += "---\n\n"
    
    # 调用 Server 酱 API
    url = f"https://sct.ftqq.com/{sendkey}.send"
    
    payload = {
        "title": title,
        "desp": desp
    }
    
    try:
        response = requests.post(url, data=payload, timeout=10)
        response.raise_for_status()
        result = response.json()
        
        if result.get('code') == 0:
            print("✅ News sent to WeChat via Server Chan successfully!")
        else:
            print(f"❌ Server Chan Error: {result.get('message')}\n")
    except Exception as e:
        print(f"❌ Error sending to Server Chan: {e}")

if __name__ == "__main__":
    print("📡 Fetching AI news...")
    articles = fetch_ai_news()
    
    if articles:
        print(f"✅ Found {len(articles)} articles")
        send_to_server_chan(articles)
    else:
        print("⚠️ No articles found")