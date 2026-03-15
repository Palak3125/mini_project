'''import pandas as pd
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

print("Models saved successfully!")'''

import pandas as pd
import pickle
import matplotlib.pyplot as plt

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

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

# 4. Train-test split (Department)
X_train, X_test, y_dept_train, y_dept_test = train_test_split(
    X, y_dept, test_size=0.2, random_state=42
)

# 5. Train Department Model
dept_model = LogisticRegression(max_iter=1000)
dept_model.fit(X_train, y_dept_train)

# Predict department
y_pred_dept = dept_model.predict(X_test)

print("\nDepartment Classification Report:")
print(classification_report(y_dept_test, y_pred_dept))

# Department Accuracy
dept_accuracy = accuracy_score(y_dept_test, y_pred_dept)
print("Department Accuracy:", dept_accuracy)

# Department Confusion Matrix Graph
cm_dept = confusion_matrix(y_dept_test, y_pred_dept)

plt.figure(figsize=(6,5))
plt.imshow(cm_dept, cmap="Blues")
plt.title("Department Confusion Matrix")
plt.colorbar()
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.savefig("department_confusion_matrix.png")
plt.close()

# 6. Train-test split (Priority)
X_train2, X_test2, y_pr_train, y_pr_test = train_test_split(
    X, y_priority, test_size=0.2, random_state=42
)

priority_model = LogisticRegression(max_iter=1000)
priority_model.fit(X_train2, y_pr_train)

# Predict priority
y_pred_pr = priority_model.predict(X_test2)

print("\nPriority Classification Report:")
print(classification_report(y_pr_test, y_pred_pr))

# Priority Accuracy
priority_accuracy = accuracy_score(y_pr_test, y_pred_pr)
print("Priority Accuracy:", priority_accuracy)

# Priority Confusion Matrix Graph
cm_pr = confusion_matrix(y_pr_test, y_pred_pr)

plt.figure(figsize=(6,5))
plt.imshow(cm_pr, cmap="Greens")
plt.title("Priority Confusion Matrix")
plt.colorbar()
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.savefig("priority_confusion_matrix.png")
plt.close()

# 7. Accuracy Comparison Graph
models = ["Department Model", "Priority Model"]
accuracy = [dept_accuracy, priority_accuracy]

plt.figure(figsize=(6,4))
plt.bar(models, accuracy, color=["blue", "green"])
plt.title("Model Accuracy Comparison")
plt.ylabel("Accuracy")
plt.ylim(0,1)
plt.savefig("model_accuracy_comparison.png")
plt.close()

# 8. Save models
pickle.dump(vectorizer, open("models/vectorizer.pkl", "wb"))
pickle.dump(dept_model, open("models/department_model.pkl", "wb"))
pickle.dump(priority_model, open("models/priority_model.pkl", "wb"))

print("\nModels saved successfully!")