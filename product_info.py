from flask import Flask, jsonify
import json

app = Flask(__name__)

# Load product specifications once at startup
with open('knowledge_base/specifications.json', 'r') as f:
    specs = json.load(f)

@app.route('/weight')
def get_weight():
    return specs['weight']

@app.route('/dimensions')
def get_dimensions():
    d = specs['dimensions']
    return f"Width: {d['width']}, Height: {d['height']}, Depth: {d['depth']}"

@app.route('/power')
def get_power():
    p = specs['power']
    return f"Voltage: {p['voltage']}, Consumption: {p['consumption']}"

@app.route('/')
def get_all():
    return jsonify(specs)

if __name__ == '__main__':
    print("\nVRG Product Information Server")
    print("-----------------------------")
    print("Available endpoints:")
    print("- /weight      - Get product weight")
    print("- /dimensions  - Get product dimensions")
    print("- /power       - Get power specifications")
    print("- /            - Get all specifications")
    print("\nServer starting on http://localhost:5000")
    app.run(host='localhost', port=5000)
