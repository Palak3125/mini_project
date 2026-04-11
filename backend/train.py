import pandas as pd
import pickle
import matplotlib.pyplot as plt
import os

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

from backend.utils import preprocess   # ✅ FIXED IMPORT

# BASE PATH (IMPORTANT)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 1. Load dataset
df = pd.read_csv(os.path.join(BASE_DIR, "data/complaints.csv"))

# 2. Preprocess text
df["clean_text"] = df["text"].apply(preprocess)

# 3. Feature extraction
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(df["clean_text"])

# Labels
y_dept = df["department"]
y_priority = df["priority"]

# 4. Train-test split (Department)
X_train, X_test, y_dept_train, y_dept_test = train_test_split(
    X, y_dept, test_size=0.2, random_state=42
)

# 5. Train Department Model
dept_model = LogisticRegression(max_iter=1000)
dept_model.fit(X_train, y_dept_train)

y_pred_dept = dept_model.predict(X_test)

print("\nDepartment Classification Report:")
print(classification_report(y_dept_test, y_pred_dept))

dept_accuracy = accuracy_score(y_dept_test, y_pred_dept)
print("Department Accuracy:", dept_accuracy)

# Save graph
plt.figure(figsize=(6,5))
plt.imshow(confusion_matrix(y_dept_test, y_pred_dept), cmap="Blues")
plt.title("Department Confusion Matrix")
plt.savefig(os.path.join(BASE_DIR, "department_confusion_matrix.png"))
plt.close()

# 6. Priority model
X_train2, X_test2, y_pr_train, y_pr_test = train_test_split(
    X, y_priority, test_size=0.2, random_state=42
)

priority_model = LogisticRegression(max_iter=1000)
priority_model.fit(X_train2, y_pr_train)

y_pred_pr = priority_model.predict(X_test2)

priority_accuracy = accuracy_score(y_pr_test, y_pred_pr)
print("Priority Accuracy:", priority_accuracy)

# Save graph
plt.figure(figsize=(6,5))
plt.imshow(confusion_matrix(y_pr_test, y_pred_pr), cmap="Greens")
plt.title("Priority Confusion Matrix")
plt.savefig(os.path.join(BASE_DIR, "priority_confusion_matrix.png"))
plt.close()

# Save models
pickle.dump(vectorizer, open(os.path.join(BASE_DIR, "models/vectorizer.pkl"), "wb"))
pickle.dump(dept_model, open(os.path.join(BASE_DIR, "models/department_model.pkl"), "wb"))
pickle.dump(priority_model, open(os.path.join(BASE_DIR, "models/priority_model.pkl"), "wb"))

print("\nModels saved successfully!")