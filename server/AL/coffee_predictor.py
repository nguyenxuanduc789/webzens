from flask import Flask, request, jsonify
import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
import requests
import ast  # Add this import for ast.literal_eval

app = Flask(__name__)


df = pd.DataFrame() 

dt_clf = DecisionTreeClassifier()
rf_clf = RandomForestClassifier()


nameproduct_mapping_reverse = {0: "Product 1", 1: "Product 2", 2: "duc", 3: "nguyenxuanduc",4: "Cà phê pha máy",5:"Black Coffee",6:"Chai Latte",7:"Mocha",8:"Vanilla Latte",9:"Americano:"}


def fetch_data_from_external_api(api_url):
    response = requests.get(api_url)
    if response.status_code == 200:
        data = response.json()
        return data
    else:
        print(f"Failed to fetch data from API. Status code: {response.status_code}")
        return None

external_api_url = 'http://192.168.1.12:3000/order/getproductuser'
external_data = fetch_data_from_external_api(external_api_url)
if external_data:
    df = pd.DataFrame(external_data)

    df["gender"] = df["gender"].astype("category").cat.codes

    
    df["size"] = df["nameproduct"].apply(lambda x: ', '.join(map(str, x)))

   
    df = df.drop("nameproduct", axis=1)

    imputer = SimpleImputer(strategy='mean')
    df[['age']] = imputer.fit_transform(df[['age']])

    X = df[["age", "gender"]]
    y = df["size"]

    dt_clf.fit(X, y)
    rf_clf.fit(X, y)

@app.route('/most_popular_coffee_preference', methods=['GET'])
def most_popular_coffee_preference():
    try:
        preference_counts = df["size"].value_counts()
        top_preferences = preference_counts.head(2).index.tolist()

        response = {'top_preferences': top_preferences}

        return jsonify(response)

    except Exception as e:
      
        return jsonify({'error': str(e)}), 500

@app.route('/predict_coffee_preference', methods=['POST'])
def predict_coffee_preference():
    try:
    
        content = request.json
        age = content['age']
        gender = content['gender']

    
        gender_code = 0 if gender.lower() == 'male' else 1

        input_data = [[age, gender_code]]

     
        dt_prediction = dt_clf.predict(input_data)[0]
        rf_prediction = rf_clf.predict(input_data)[0]

     
        best_model_prediction = dt_prediction if dt_prediction >= rf_prediction else rf_prediction

        product_list = ast.literal_eval(best_model_prediction)

     
        product_names = [product.get("name", "") for product in product_list]

        response = {'predicted_product_names': product_names}

        return jsonify(response)

    except Exception as e:
      
        print(f"Error: {e}")
      
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='192.168.1.12', port=3001)
