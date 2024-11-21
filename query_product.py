import requests
import sys

def get_info(query):
    query = query.lower().strip()
    base_url = 'http://localhost:5000'
    
    if 'weight' in query:
        response = requests.get(f'{base_url}/weight')
        return response.text
        
    if any(x in query for x in ['dimension', 'size']):
        response = requests.get(f'{base_url}/dimensions')
        return response.text
        
    if 'power' in query:
        response = requests.get(f'{base_url}/power')
        return response.text
        
    return "Please ask about: weight, dimensions, or power"

if __name__ == '__main__':
    if len(sys.argv) > 1:
        # Get query from command line arguments
        query = ' '.join(sys.argv[1:])
        print(get_info(query))
    else:
        print("Please provide a query, e.g.:")
        print("python query_product.py what is the weight")
