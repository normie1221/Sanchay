from typing import Dict
import google.generativeai as genai
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Configure Gemini API
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
genai.configure(api_key=GOOGLE_API_KEY)

class FinancialAdvisor:
    def __init__(self):
        # Configure the model with Gemini 2.0 Flash
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        
    def analyze_purchase(self, user_input: str, financial_data: Dict) -> str:
        """Analyze if a purchase is advisable given the user's financial goals"""
        
        # Calculate progress percentage
        progress_percentage = (financial_data["current_goal"]["current"] / 
                            financial_data["current_goal"]["target"]) * 100
        
        # Create the prompt
        prompt = f"""You are a financial advisor analyzing spending patterns and goals.
        Current financial goal: {financial_data['current_goal']['name']}
        Monthly budget: ${financial_data['budget']}
        Current progress: ${financial_data['current_goal']['current']} / ${financial_data['current_goal']['target']}
        Deadline: {financial_data['current_goal']['deadline']}
        
        Based on the financial goal and budget, analyze if the proposed purchase is advisable.
        Consider:
        1. Current progress towards goal ({progress_percentage:.1f}% complete)
        2. Time remaining until deadline
        3. Purchase necessity
        4. Impact on goal timeline
        
        User Query: {user_input}
        
        Provide clear reasoning for your recommendation.
        End with a clear YES/NO recommendation."""
        
        # Get response from model
        response = self.model.generate_content(prompt)
        return response.text

# Create singleton instance
advisor = FinancialAdvisor()

# Function to get response
def get_advice(message: str, financial_data: Dict) -> str:
    """Get financial advice for a specific query"""
    return advisor.analyze_purchase(message, financial_data)