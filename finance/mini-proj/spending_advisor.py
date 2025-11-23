import google.generativeai as genai
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Configure Gemini API
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
genai.configure(api_key=GOOGLE_API_KEY)

def analyze_spending(user_input: str, goal_name: str, goal_amount: float, 
                    current_amount: float, deadline: str, monthly_budget: float) -> str:
    """Analyze spending decisions based on financial goals"""
    
    # Calculate progress percentage
    progress_percentage = (current_amount / goal_amount) * 100
    
    # Create the model using Gemini 2.0 Flash
    model = genai.GenerativeModel('gemini-2.0-flash')
    
    # Configure the model for more focused responses
    safety_settings = {
        "HARM_CATEGORY_HARASSMENT": "BLOCK_NONE",
        "HARM_CATEGORY_HATE_SPEECH": "BLOCK_NONE",
        "HARM_CATEGORY_SEXUALLY_EXPLICIT": "BLOCK_NONE",
        "HARM_CATEGORY_DANGEROUS_CONTENT": "BLOCK_NONE",
    }
    
    # Create the prompt
    prompt = f"""You are a financial advisor analyzing spending patterns and goals.
    Current financial goal: {goal_name}
    Monthly budget: ${monthly_budget}
    Current progress: ${current_amount} / ${goal_amount}
    Deadline: {deadline}
    Progress: {progress_percentage:.1f}%
    
    Based on the financial goal and budget, analyze if the proposed purchase is advisable.
    Consider:
    1. Current progress towards goal
    2. Time remaining until deadline
    3. Purchase necessity and amount
    4. Impact on goal timeline
    5. Monthly budget constraints
    
    User Query: {user_input}
    
    Provide a detailed analysis with clear reasoning.
    Format your response with:
    1. Extracted purchase amount (if mentioned)
    2. Analysis of financial impact
    3. Consideration of goal progress
    4. Clear YES/NO recommendation
    5. Alternative suggestions if saying NO
    """
    
    # Get response from model with more focused parameters
    response = model.generate_content(
        prompt,
        generation_config={
            "temperature": 0.7,
            "top_p": 0.8,
            "top_k": 40,
            "max_output_tokens": 1024,
        },
        safety_settings=safety_settings
    )
    return response.text