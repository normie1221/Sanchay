import streamlit as st
from spending_advisor_bot import AgentState, app
from langchain_core.messages import HumanMessage
import pandas as pd
from datetime import datetime

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
user_input = st.text_input("Your message:")

if user_input:
    # Create state for the graph
    state = AgentState(
        messages=[HumanMessage(content=user_input)],
        current_goal={
            "name": goal_name,
            "target": goal_amount,
            "current": goal_current,
            "deadline": goal_deadline.strftime("%Y-%m-%d")
        },
        spending_history=pd.DataFrame(),  # This would be connected to actual spending data
        budget=monthly_budget
    )
    
    # Run the graph
    final_state = app.invoke(state)
    
    # Add messages to chat history
    st.session_state.messages.append({"role": "user", "content": user_input})
    st.session_state.messages.append({"role": "assistant", "content": final_state["messages"][-1].content})

# Display chat history
for message in st.session_state.messages:
    if message["role"] == "user":
        st.write(f"You: {message['content']}")
    else:
        st.write(f"Advisor: {message['content']}")