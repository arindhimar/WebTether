from functools import wraps
from flask import request, jsonify
import requests
import os

def clerk_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        session_token = request.headers.get('Authorization', '').split('Bearer ')[-1]
        if not session_token:
            return jsonify({'error': 'Unauthorized'}), 401

        CLERK_API_KEY = os.getenv('CLERK_SECRET_KEY')
        response = requests.get(
            'https://api.clerk.dev/v1/sessions/verify',
            json={'token': session_token},
            headers={'Authorization': f'Bearer {CLERK_API_KEY}'}
        )

        if response.status_code != 200:
            return jsonify({'error': 'Invalid session'}), 401

        user_data = response.json()
        return f(user_data, *args, **kwargs)
    return decorated_function