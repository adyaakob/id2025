from huggingface_hub import HfApi
import os

def test_token():
    # Set token directly
    token = "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"
    os.environ['HUGGING_FACE_TOKEN'] = token
    
    try:
        api = HfApi()
        user_info = api.whoami(token=token)
        print("\nToken verification successful!")
        if user_info:
            print(f"Successfully authenticated with Hugging Face!")
        
        # Check Llama 2 access specifically
        print("\nChecking Llama 2 access...")
        try:
            api.model_info("meta-llama/Llama-2-7b-chat-hf", token=token)
            print("[SUCCESS] You have access to Llama 2 models")
        except Exception as e:
            print("[NOTICE] You don't have access to Llama 2 yet.")
            print("Please accept the terms at: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf")
            print("\nAfter accepting the terms, you can run the LLM assistant with:")
            print("python llm_assistant.py")
        
    except Exception as e:
        print(f"\nError verifying token: {str(e)}")
        print("Please make sure your token is valid and try again.")

if __name__ == "__main__":
    print("Testing Hugging Face token...")
    test_token()
