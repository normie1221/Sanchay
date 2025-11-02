const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Setting up database...');
  
  // Create or update test user
  const user = await prisma.user.upsert({
    where: { clerkId: 'dev_test_user_123' },
    update: {},
    create: {
      clerkId: 'dev_test_user_123',
      email: 'dev@test.com',
      firstName: 'Test',
      lastName: 'User',
    },
  });

  console.log('✅ Test user created/updated:', user);

  // Create sample data
  console.log('\nCreating sample data...');

  // Sample Income
  const income = await prisma.income.upsert({
    where: { id: 'sample-income-1' },
    update: {},
    create: {
      id: 'sample-income-1',
      userId: user.id,
      source: 'Monthly Salary',
      amount: 5000,
      frequency: 'MONTHLY',
      date: new Date(),
      category: 'SALARY',
      description: 'Regular monthly salary',
      isRecurring: true,
    },
  });
  console.log('✅ Sample income created');

  // Sample Expenses
  const expenses = await Promise.all([
    prisma.expense.upsert({
      where: { id: 'sample-expense-1' },
      update: {},
      create: {
        id: 'sample-expense-1',
        userId: user.id,
        amount: 1200,
        category: 'Housing',
        description: 'Rent payment',
        date: new Date(),
        merchant: 'Landlord',
        paymentMethod: 'Bank Transfer',
        isRecurring: true,
        tags: [],
      },
    }),
    prisma.expense.upsert({
      where: { id: 'sample-expense-2' },
      update: {},
      create: {
        id: 'sample-expense-2',
        userId: user.id,
        amount: 150,
        category: 'Utilities',
        description: 'Electric bill',
        date: new Date(),
        merchant: 'Power Company',
        paymentMethod: 'Credit Card',
        isRecurring: true,
        tags: [],
      },
    }),
    prisma.expense.upsert({
      where: { id: 'sample-expense-3' },
      update: {},
      create: {
        id: 'sample-expense-3',
        userId: user.id,
        amount: 450,
        category: 'Food',
        description: 'Groceries',
        date: new Date(),
        merchant: 'Supermarket',
        paymentMethod: 'Debit Card',
        isRecurring: false,
        tags: ['groceries', 'food'],
      },
    }),
  ]);
  console.log('✅ Sample expenses created');

  // Sample Budgets
  const budgets = await Promise.all([
    prisma.budget.upsert({
      where: { id: 'sample-budget-1' },
      update: {},
      create: {
        id: 'sample-budget-1',
        userId: user.id,
        category: 'Housing',
        limit: 1300,
        period: 'MONTHLY',
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        spent: 1200,
        alertThreshold: 90,
        isAiGenerated: false,
      },
    }),
    prisma.budget.upsert({
      where: { id: 'sample-budget-2' },
      update: {},
      create: {
        id: 'sample-budget-2',
        userId: user.id,
        category: 'Food',
        limit: 600,
        period: 'MONTHLY',
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        spent: 450,
        alertThreshold: 80,
        isAiGenerated: false,
      },
    }),
  ]);
  console.log('✅ Sample budgets created');

  // Sample Financial Goals
  const goals = await Promise.all([
    prisma.financialGoal.upsert({
      where: { id: 'sample-goal-1' },
      update: {},
      create: {
        id: 'sample-goal-1',
        userId: user.id,
        name: 'Emergency Fund',
        targetAmount: 10000,
        currentAmount: 3500,
        deadline: new Date(new Date().setMonth(new Date().getMonth() + 12)),
        category: 'EMERGENCY_FUND',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
      },
    }),
    prisma.financialGoal.upsert({
      where: { id: 'sample-goal-2' },
      update: {},
      create: {
        id: 'sample-goal-2',
        userId: user.id,
        name: 'Vacation Fund',
        targetAmount: 3000,
        currentAmount: 1200,
        deadline: new Date(new Date().setMonth(new Date().getMonth() + 6)),
        category: 'SAVINGS',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
      },
    }),
  ]);
  console.log('✅ Sample goals created');

  console.log('\n✨ Database setup complete!\n');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
