import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

nltk.download('stopwords')
nltk.download('wordnet')

stop_words = set(stopwords.words('english'))
lemmatizer = WordNetLemmatizer()

def preprocess(text):
    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    words = text.split()
    words = [lemmatizer.lemmatize(word) for word in words if word not in stop_words]
    return " ".join(words)

def fallback_priority(text):
    text = text.lower()

    if "urgent" in text or "emergency" in text:
        return "High"
    elif "not working" in text:
        return "Medium"
    else:
        return "Low"

def normalize_text(text):
    text = text.lower().strip()

    if "wifi" in text or "internet" in text:
        return "wifi not working"
    if "water" in text and ("leak" in text or "tap" in text):
        return "water leakage"
    if "electric" in text or "power" in text:
        return "power issue"
    if "fan" in text or "ac" in text:
        return "cooling issue"

    return text