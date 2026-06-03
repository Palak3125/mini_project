# Automated Grievance Triage System

## Overview

The Automated Grievance Triage System is an AI-powered complaint management platform designed to streamline the process of registering, categorizing, and routing grievances to the appropriate departments.

The system leverages Natural Language Processing (NLP) and Machine Learning techniques to analyze complaint descriptions and automatically assign them to the most relevant department, reducing manual effort and improving response efficiency.

---

## Problem Statement

Traditional grievance management systems rely heavily on manual complaint review and routing. This often leads to:

* Delayed complaint resolution
* Incorrect department assignment
* Increased administrative workload
* Difficulty tracking complaint status
* Inefficient handling of large complaint volumes

The Automated Grievance Triage System addresses these challenges by automating complaint classification and routing using AI.

---

## Key Features

### User Features

* Submit grievances online
* Track complaint status
* View complaint history
* Receive department assignment automatically

### Admin Features

* View all complaints
* Monitor complaint status
* Manage complaint workflow
* Track department-wise complaints

### AI Features

* Automatic complaint classification
* Intelligent department prediction
* NLP-based text processing
* Duplicate complaint detection

---

## Technology Stack

### Frontend

* HTML
* CSS
* JavaScript
* Bootstrap

### Backend

* Python
* Flask

### Database

* MySQL

### Machine Learning

* Scikit-Learn
* TF-IDF Vectorizer
* Logistic Regression

---

## System Architecture

User Complaint
↓
Text Preprocessing
↓
TF-IDF Vectorization
↓
Logistic Regression Model
↓
Department Prediction
↓
Database Storage
↓
Admin Dashboard & Tracking

---

## Machine Learning Workflow

### 1. Data Preprocessing

* Convert text to lowercase
* Remove unwanted characters
* Clean complaint descriptions

### 2. Feature Extraction

The complaint text is transformed into numerical vectors using TF-IDF (Term Frequency-Inverse Document Frequency).

### 3. Model Training

A Logistic Regression classifier is trained on historical complaint data mapped to departments.

### 4. Prediction

When a user submits a complaint, the trained model predicts the most suitable department.

### 5. Routing

The complaint is automatically routed to the predicted department.

---

## Why Logistic Regression?

Logistic Regression was selected because:

* Performs well on text classification problems
* Fast training and prediction
* Computationally efficient
* Easy to interpret and maintain
* Suitable for small and medium-sized datasets

---

## Database Structure

### Users Table

Stores user information and login details.

### Complaints Table

Stores complaint details submitted by users.

### Complaint Master Table

Stores complaint categories and department mappings.

### Admin Table

Stores administrator credentials and privileges.

---

## Installation

### Clone Repository

```bash
git clone https://github.com/Palak3125/Automated-Grievance-Triage-System.git
cd Automated-Grievance-Triage-System
```

### Install Backend Dependencies

```bash
pip install -r requirements.txt
```

### Configure MySQL Database

1. Create a MySQL database.
2. Update database credentials in the Flask configuration.
3. Run migration scripts if required.

### Start Backend Server

```bash
cd backend
python app.py
```

### Start Frontend Server

```bash
cd frontend
npm install
npm run dev
```

---

## Running the Application

After starting both servers:

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:5000
```

---

## Objectives

* Automate complaint routing
* Reduce manual intervention
* Improve complaint resolution efficiency
* Enhance transparency in grievance handling
* Utilize AI for intelligent complaint categorization

---

## Future Enhancements

* Deep Learning based classification
* Sentiment Analysis
* Complaint Priority Prediction
* Multi-language Support
* Email/SMS Notifications
* Analytics Dashboard
* Cloud Deployment
* Mobile Application Integration

---

## Results

* Automated complaint categorization
* Faster department assignment
* Reduced manual processing effort
* Improved grievance management workflow

---

## Screenshots
<img width="1900" height="983" alt="Screenshot 2026-06-03 115713" src="https://github.com/user-attachments/assets/bbc9083f-e0e1-4938-9b82-fd1e0cf63617" />
---

## License

This project was developed for academic and educational purposes.
