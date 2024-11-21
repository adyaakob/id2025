"""
Available model options for the LLM Assistant.
These are some popular open-source models you can use.
"""

AVAILABLE_MODELS = {
    "llama2-7b": {
        "name": "meta-llama/Llama-2-7b-chat-hf",
        "description": "Meta's 7B parameter chat model, good balance of performance and resource usage",
        "min_ram": "16GB",
        "requires_auth": True
    },
    "falcon-7b": {
        "name": "tiiuae/falcon-7b-instruct",
        "description": "TII's 7B parameter instruction-following model",
        "min_ram": "16GB",
        "requires_auth": False
    },
    "mpt-7b": {
        "name": "mosaicml/mpt-7b-instruct",
        "description": "MosaicML's 7B parameter instruction-following model",
        "min_ram": "16GB",
        "requires_auth": False
    },
    "bloom-3b": {
        "name": "bigscience/bloom-3b",
        "description": "Smaller multilingual model, good for systems with less RAM",
        "min_ram": "8GB",
        "requires_auth": False
    },
    "opt-2.7b": {
        "name": "facebook/opt-2.7b",
        "description": "Meta's OPT model, good performance on lower-end hardware",
        "min_ram": "8GB",
        "requires_auth": False
    }
}

def list_models():
    """Print information about all available models."""
    print("\nAvailable Models:")
    print("----------------")
    for key, model in AVAILABLE_MODELS.items():
        print(f"\n{key}:")
        print(f"  Model: {model['name']}")
        print(f"  Description: {model['description']}")
        print(f"  Minimum RAM: {model['min_ram']}")
        print(f"  Requires Authentication: {'Yes' if model['requires_auth'] else 'No'}")

def get_model_info(model_key):
    """Get information about a specific model."""
    return AVAILABLE_MODELS.get(model_key, None)

if __name__ == "__main__":
    list_models()
