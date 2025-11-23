import { GoogleGenerativeAI } from '@google/generative-ai';

interface FinancialGoalData {
  name: string;
  target: number;
  current: number;
  deadline: string;
}

interface FinancialData {
  currentGoal: FinancialGoalData;
  budget: number;
  monthlyIncome?: number;
  totalExpenses?: number;
  savingsRate?: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

class AIAdvisorService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY is not configured');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Using gemini-2.0-flash for latest model
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    });
  }

  /**
   * Analyze a purchase decision based on user's financial goals
   */
  async analyzePurchase(userQuery: string, financialData: FinancialData): Promise<string> {
    try {
      const progressPercentage = (financialData.currentGoal.current / financialData.currentGoal.target) * 100;
      const remaining = financialData.currentGoal.target - financialData.currentGoal.current;

      const prompt = `You are a professional financial advisor analyzing spending decisions and financial goals. All amounts are in Indian Rupees (INR/₹).

Current Financial Situation:
- Financial Goal: ${financialData.currentGoal.name}
- Target Amount: ₹${financialData.currentGoal.target.toLocaleString()}
- Current Progress: ₹${financialData.currentGoal.current.toLocaleString()} (${progressPercentage.toFixed(1)}% complete)
- Remaining Amount: ₹${remaining.toLocaleString()}
- Goal Deadline: ${financialData.currentGoal.deadline}
- Monthly Budget: ₹${financialData.budget.toLocaleString()}
${financialData.monthlyIncome ? `- Monthly Income: ₹${financialData.monthlyIncome.toLocaleString()}` : ''}
${financialData.totalExpenses ? `- Total Monthly Expenses: ₹${financialData.totalExpenses.toLocaleString()}` : ''}
${financialData.savingsRate ? `- Current Savings Rate: ${financialData.savingsRate.toFixed(1)}%` : ''}

User Query: ${userQuery}

Please analyze whether this purchase is advisable based on:
1. Current progress towards the financial goal (${progressPercentage.toFixed(1)}% complete)
2. Time remaining until the deadline
3. The necessity and value of this purchase
4. Impact on the goal timeline and monthly budget
5. Alternative options or compromises

Provide:
- A brief analysis of the situation
- Specific reasoning for your recommendation
- Practical advice or alternatives if applicable
- A clear YES (advisable) or NO (not advisable) recommendation

IMPORTANT: Use ₹ (Indian Rupees) for all monetary amounts in your response, not $ (dollars).
Keep your response conversational, helpful, and under 300 words.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error in AI advisor:', error);
      throw new Error('Failed to generate financial advice');
    }
  }

  /**
   * Get general financial advice
   */
  async getGeneralAdvice(userQuery: string, financialData: FinancialData): Promise<string> {
    try {
      const progressPercentage = (financialData.currentGoal.current / financialData.currentGoal.target) * 100;

      const prompt = `You are a professional financial advisor providing personalized financial guidance. All amounts are in Indian Rupees (INR/₹).

Current Financial Situation:
- Financial Goal: ${financialData.currentGoal.name}
- Target Amount: ₹${financialData.currentGoal.target.toLocaleString()}
- Current Progress: ₹${financialData.currentGoal.current.toLocaleString()} (${progressPercentage.toFixed(1)}% complete)
- Goal Deadline: ${financialData.currentGoal.deadline}
- Monthly Budget: ₹${financialData.budget.toLocaleString()}
${financialData.monthlyIncome ? `- Monthly Income: ₹${financialData.monthlyIncome.toLocaleString()}` : ''}
${financialData.totalExpenses ? `- Total Monthly Expenses: ₹${financialData.totalExpenses.toLocaleString()}` : ''}

User Question: ${userQuery}

Provide helpful, actionable financial advice based on their current situation and goals. 
IMPORTANT: Use ₹ (Indian Rupees) for all monetary amounts in your response, not $ (dollars).
Be specific, practical, and supportive. Keep your response under 300 words.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error in AI advisor:', error);
      throw new Error('Failed to generate financial advice');
    }
  }

  /**
   * Analyze spending patterns and provide insights
   */
  async analyzeSpendingPatterns(
    expenses: Array<{ category: string; amount: number; date: string }>,
    financialData: FinancialData
  ): Promise<string> {
    try {
      const totalSpending = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const categoryBreakdown = expenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
      }, {} as Record<string, number>);

      const breakdown = Object.entries(categoryBreakdown)
        .map(([cat, amt]) => `${cat}: ₹${amt.toFixed(2)} (${((amt / totalSpending) * 100).toFixed(1)}%)`)
        .join('\n');

      const prompt = `You are a financial advisor analyzing spending patterns. All amounts are in Indian Rupees (INR/₹).

Financial Goal: ${financialData.currentGoal.name}
Monthly Budget: ₹${financialData.budget.toLocaleString()}
Total Spending: ₹${totalSpending.toFixed(2)}

Spending by Category:
${breakdown}

Provide:
1. Key insights about the spending patterns
2. Areas where spending could be optimized
3. Specific recommendations to help achieve the financial goal
4. Positive reinforcement for good spending habits

IMPORTANT: Use ₹ (Indian Rupees) for all monetary amounts in your response, not $ (dollars).
Keep your response actionable and under 250 words.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error analyzing spending patterns:', error);
      throw new Error('Failed to analyze spending patterns');
    }
  }

  /**
   * Get budget recommendations
   */
  async getBudgetRecommendations(financialData: FinancialData): Promise<string> {
    try {
      const monthsToGoal = this.calculateMonthsToGoal(financialData.currentGoal.deadline);
      const remaining = financialData.currentGoal.target - financialData.currentGoal.current;
      const monthlySavingsNeeded = remaining / Math.max(monthsToGoal, 1);

      const prompt = `You are a financial advisor creating a budget plan. All amounts are in Indian Rupees (INR/₹).

Financial Goal: ${financialData.currentGoal.name}
Target: ₹${financialData.currentGoal.target.toLocaleString()}
Current Progress: ₹${financialData.currentGoal.current.toLocaleString()}
Remaining: ₹${remaining.toLocaleString()}
Months to Goal: ${monthsToGoal}
Monthly Savings Needed: ₹${monthlySavingsNeeded.toFixed(2)}
Current Monthly Budget: ₹${financialData.budget.toLocaleString()}
${financialData.monthlyIncome ? `Monthly Income: ₹${financialData.monthlyIncome.toLocaleString()}` : ''}

Provide:
1. A realistic budget breakdown (housing, food, transportation, savings, discretionary)
2. Specific recommendations to meet the savings goal
3. Tips for reducing expenses if needed
4. Encouragement and achievable action steps

IMPORTANT: Use ₹ (Indian Rupees) for all monetary amounts in your response, not $ (dollars).
Keep your response practical and under 300 words.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating budget recommendations:', error);
      throw new Error('Failed to generate budget recommendations');
    }
  }

  private calculateMonthsToGoal(deadline: string): number {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = Math.abs(deadlineDate.getTime() - today.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    return diffMonths;
  }
}

// Export singleton instance
export const aiAdvisorService = new AIAdvisorService();
export type { FinancialData, ChatMessage };
