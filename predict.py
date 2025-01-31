# predict.py
import sys
import json
import joblib
import numpy as np

# Load models and scaler
delay_model = joblib.load('delay_model.pkl')
defect_model = joblib.load('defect_model.pkl')
scaler = joblib.load('feature_scaler.pkl')

# Define feature order to ensure consistency
FEATURE_ORDER = [
    'weight',
    'temperature',
    'speed',
    'processTime',
    'components',
    'efficiency',
    'quantity'
]

def main():
    # Read JSON data from stdin
    data = json.load(sys.stdin)
    
    # Create feature array in correct order
    features = np.array([[float(data[feature]) for feature in FEATURE_ORDER]])
    
    # Scale the features
    scaled_features = scaler.transform(features)
    
    # Make predictions
    delay_prediction = delay_model.predict(scaled_features)[0]
    defect_prediction = defect_model.predict(scaled_features)[0]
    
    # Prepare result
    result = {
        'delay_prediction': round(delay_prediction, 2),
        'defect_prediction': round(defect_prediction, 4)
    }
    
    # Print result as JSON to stdout
    print(json.dumps(result))

if __name__ == "__main__":
    main()
