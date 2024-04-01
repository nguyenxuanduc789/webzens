from flask import Flask, request, jsonify
import json
from textblob import TextBlob  # Hoặc sử dụng thư viện NLP khác

app = Flask(__name__)

JSON_FILE_PATH = "comments.json"

# Giả sử bạn có một model NLP hoặc sử dụng thư viện TextBlob
def analyze_sentiment(comment_text):
    doc = TextBlob(comment_text)
    polarity = doc.sentiment.polarity

    if polarity > 0:
        return "positive"
    elif polarity == 0:
        return "neutral"
    else:
        return "negative"

@app.route('/comments', methods=['GET'])
def get_comments():
    try:
        with open(JSON_FILE_PATH, 'r', encoding='utf-8') as file:
            data = json.load(file)
        return jsonify(data)
    except FileNotFoundError:
        return jsonify([])

@app.route('/comments', methods=['POST'])
def add_comment():
    new_comment = request.get_json()

    # Xử lý ngôn ngữ tự nhiên
    comment_text = new_comment.get("comment", "")
    sentiment = analyze_sentiment(comment_text)

    # Thêm thông tin sentiment vào comment
    new_comment["sentiment"] = sentiment

    try:
        with open(JSON_FILE_PATH, 'r', encoding='utf-8') as file:
            data = json.load(file)
    except FileNotFoundError:
        data = []

    data.append(new_comment)

    with open(JSON_FILE_PATH, 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=2, ensure_ascii=False)

    return jsonify({"message": "Comment added successfully", "sentiment": sentiment})

if __name__ == '__main__':
    app.run(debug=True, host='192.168.1.12', port=3003)
