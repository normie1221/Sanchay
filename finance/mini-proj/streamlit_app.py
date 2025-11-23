import streamlit as st
from datetime import datetime
import pandas as pd
from financial_advisor import get_advice

st.title("AI Spending Advisor")

# Initialize session state
if "messages" not in st.session_state:
    st.session_state.messages = []

# Sidebar for goal setting
st.sidebar.header("Set Your Financial Goal")
goal_name = st.sidebar.text_input("Goal Name", "Emergency Fund")
goal_amount = st.sidebar.number_input("Target Amount ($)", min_value=0, value=10000)
goal_current = st.sidebar.number_input("Current Progress ($)", min_value=0, value=5000)
goal_deadline = st.sidebar.date_input("Goal Deadline")
monthly_budget = st.sidebar.number_input("Monthly Budget ($)", min_value=0, value=3000)

# Main chat interface
st.write("Ask about a purchase or get spending advice!")

# User input
user_input = st.text_input("Your message:", placeholder="Example: I want to buy a laptop for $1200...")

if user_input:
    # Prepare financial data
    financial_data = {
        "current_goal": {
            "name": goal_name,
            "target": goal_amount,
            "current": goal_current,
            "deadline": goal_deadline.strftime("%Y-%m-%d")
        },
        "budget": monthly_budget
    }
    
    # Get AI response
    response = get_advice(user_input, financial_data)
    
    # Add messages to chat history
    st.session_state.messages.append({"role": "user", "content": user_input})
    st.session_state.messages.append({"role": "assistant", "content": response})

# Display chat history
for message in st.session_state.messages:
    if message["role"] == "user":
        st.write(f"You: {message['content']}")
    else:
        st.write(f"Advisor: {message['content']}")