import os
import json
from flask import Flask, request, jsonify
import googleapiclient.discovery
from google.oauth2.credentials import Credentials
import gspread

# Initialize the Flask app
app = Flask(__name__)

# Load OAuth credentials from environment variables
CLIENT_ID = os.environ.get('96651896772-a10mgb1j7li8779sk8pc36t7tml16srj.apps.googleusercontent.com')
CLIENT_SECRET = os.environ.get('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')

# Create an instance of the Google Sheets API
def get_google_sheets_api():
    creds = Credentials.from_authorized_user_info({
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'refresh_token': None,
        'scopes': ['https://www.googleapis.com/auth/spreadsheets'],
    })
    gc = gspread.authorize(creds)
    return gc

# Function to add information to the Google Sheet
@app.route('/add_info', methods=['POST'])
def add_info():
    try:
        data = json.loads(request.data)
        # Validate data
        if 'date' not in data or 'hour' not in data or 'information' not in data:
            raise ValueError('Invalid data.')

        # Format the data to be added to the Google Sheet
        row_data = [
            [data['date'], data['hour'], data['information']]
        ]

        # Connect to the Google Sheets API
        gc = get_google_sheets_api()

        # Replace 'Your_Google_Sheet_Name' with the actual name of your Google Sheet
        sheet = gc.open('timecard').worksheet('Sheet1')

        # Append the data to the Google Sheet
        sheet.insert_rows(row_data)

        return jsonify({'message': 'Information added successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Function to retrieve data for a given week
@app.route('/get_info', methods=['GET'])
def get_info():
    try:
        # Connect to the Google Sheets API
        gc = get_google_sheets_api()

        # Replace 'Your_Google_Sheet_Name' with the actual name of your Google Sheet
        sheet = gc.open('timecard').worksheet('Sheet1')

        # Get all values from the sheet
        values = sheet.get_all_values()

        # Convert the values to a list of dictionaries
        data = []
        for row in values[1:]:  # Skip the header row
            date = row[0]
            hour = int(row[1])
            information = row[2]
            data.append({'date': date, 'hour': hour, 'information': information})

        return jsonify({'data': data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
