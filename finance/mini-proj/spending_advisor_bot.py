from typing import Dict
import os
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, AIMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
import pandas as pd
import google.generativeai as genai

# Configure Gemini API
GOOGLE_API_KEY = "AIzaSyD8OfLEunmT2SruqU4nvumniZ4824X_QS4"
genai.configure(api_key=GOOGLE_API_KEY)

class FinancialAdvisor:
class AgentState(TypedDict):
    messages: Sequence[HumanMessage | AIMessage]
    current_goal: dict
    spending_history: pd.DataFrame
    budget: float

# Initialize Gemini model
llm = ChatGoogleGenerativeAI(
    model="gemini-pro",
    google_api_key=GOOGLE_API_KEY,
    temperature=0.7,
    convert_system_message_to_human=True
)

# Create prompt templates
analyze_spending_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a financial advisor analyzing spending patterns and goals.
    Current financial goal: {goal}
    Monthly budget: ${budget}
    
    Based on the spending history and current goal, analyze if the proposed purchase is advisable.
    Consider:
    1. Current progress towards goal
    2. Monthly spending patterns
    3. Purchase necessity
    4. Impact on goal timeline
    
    Provide clear reasoning for your recommendation."""),
    ("human", "{input}")
])

# Define node functions
def analyze_spending(state: AgentState):
    """Analyze spending patterns and make recommendations"""
    messages = state["messages"]
    latest_message = messages[-1].content
    
    spending_analysis = llm.invoke(
        analyze_spending_prompt.format(
            goal=state["current_goal"],
            budget=state["budget"],
            input=latest_message
        )
    )
    
    return {"messages": [*messages, AIMessage(content=spending_analysis.content)]}

def update_spending_history(state: AgentState):
    """Update spending history with new transaction"""
    # This would normally update the spending history DataFrame
    # For now, we'll just pass through
    return state

# Create the graph
workflow = Graph()

# Add nodes
workflow.add_node("analyze_spending", analyze_spending)
workflow.add_node("update_history", update_spending_history)

# Create edges
workflow.add_edge("analyze_spending", "update_history")

# Set entry point
workflow.set_entry_point("analyze_spending")

# Compile the graph
app = workflow.compile()

# Example usage
if __name__ == "__main__":
    # Initialize state
    initial_state = AgentState(
        messages=[
            HumanMessage(content="I want to buy a new laptop for $1200. My monthly income is $4000.")
        ],
        current_goal={
            "name": "Emergency Fund",
            "target": 10000,
            "current": 5000,
            "deadline": "2024-12-31"
        },
        spending_history=pd.DataFrame(),  # This would be loaded with actual spending data
        budget=3000.0
    )

    # Run the graph
    final_state = app.invoke(initial_state)
    
    # Print the response
    print(final_state["messages"][-1].content)