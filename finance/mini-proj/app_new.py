import streamlit as st
from datetime import datetime
from spending_advisor import analyze_spending

st.title("AI Financial Advisor 💰")

# Initialize session state
if "messages" not in st.session_state:
    st.session_state.messages = []

# Sidebar for goal setting
st.sidebar.header("Set Your Financial Goal 🎯")
goal_name = st.sidebar.text_input("Goal Name", "Emergency Fund")
goal_amount = st.sidebar.number_input("Target Amount ($)", min_value=0, value=10000)
goal_current = st.sidebar.number_input("Current Progress ($)", min_value=0, value=5000)
goal_deadline = st.sidebar.date_input("Goal Deadline")
monthly_budget = st.sidebar.number_input("Monthly Budget ($)", min_value=0, value=3000)

# Calculate and display progress
progress = (goal_current / goal_amount) * 100 if goal_amount > 0 else 0
st.sidebar.progress(progress / 100)
st.sidebar.write(f"Progress: {progress:.1f}%")

# Main interface
st.write("💬 Ask me about a purchase you're considering!")
st.write("Example: 'I want to buy a laptop for $1200' or 'Should I spend $50 on dining out?'")

# User input
user_input = st.text_input("Your question:", placeholder="Example: Can I afford to buy a new phone for $800?")

# Main chat interface
st.write("💬 Ask about a purchase or get spending advice!")

# User input
user_input = st.text_input("Your message:", placeholder="Example: I want to buy a laptop for $1200...")

if user_input:
    try:
        # Get AI response
        response = analyze_spending(
            user_input=user_input,
            goal_name=goal_name,
            goal_amount=goal_amount,
            current_amount=goal_current,
            deadline=goal_deadline.strftime("%Y-%m-%d"),
            monthly_budget=monthly_budget
        )
        
        # Add messages to chat history
        st.session_state.messages.append({"role": "user", "content": user_input})
        st.session_state.messages.append({"role": "assistant", "content": response})
        
    except Exception as e:
        st.error(f"An error occurred: {str(e)}")

# Display chat history
for message in st.session_state.messages:
    if message["role"] == "user":
        st.write(f"🤔 You: {message['content']}")
    else:
        st.write(f"🤖 Advisor: {message['content']}")