import pandas as pd
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from utils import preprocess

# 1. Load dataset
df = pd.read_csv("data/complaints.csv")

# 2. Preprocess text
df["clean_text"] = df["text"].apply(preprocess)

# 3. Feature extraction
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(df["clean_text"])

# Labels
y_dept = df["department"]
y_priority = df["priority"]

# 4. Train-test split
X_train, X_test, y_dept_train, y_dept_test = train_test_split(
    X, y_dept, test_size=0.2, random_state=42
)

# 5. Train Department Model
dept_model = LogisticRegression(max_iter=1000)
dept_model.fit(X_train, y_dept_train)

# Evaluate
y_pred_dept = dept_model.predict(X_test)
print("Department Classification Report:")
print(classification_report(y_dept_test, y_pred_dept))

# 6. Train Priority Model
X_train2, X_test2, y_pr_train, y_pr_test = train_test_split(
    X, y_priority, test_size=0.2, random_state=42
)

priority_model = LogisticRegression(max_iter=1000)
priority_model.fit(X_train2, y_pr_train)

# Evaluate
y_pred_pr = priority_model.predict(X_test2)
print("Priority Classification Report:")
print(classification_report(y_pr_test, y_pred_pr))

# 7. Save models
pickle.dump(vectorizer, open("models/vectorizer.pkl", "wb"))
pickle.dump(dept_model, open("models/department_model.pkl", "wb"))
pickle.dump(priority_model, open("models/priority_model.pkl", "wb"))

print("Models saved successfully!")