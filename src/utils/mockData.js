export const generateMockData = () => {
    const departments = {};
    const users = {};
    const expenses = {};

    const departmentNames = ['Engineering', 'Sales', 'Marketing', 'HR'];
    departmentNames.forEach((name, i) => {
        const id = `dept-${i}`;
        departments[id] = { id, name, userCount: 0, totalSpending: 0 };
    });

    const firstNames = ['John', 'Jane', 'Peter', 'Mary', 'David', 'Sarah'];
    const lastNames = ['Smith', 'Jones', 'Williams', 'Brown', 'Davis', 'Miller'];
    const expenseCategories = ['Supplies', 'Software', 'Gas', 'Food', 'Other'];

    for (let i = 0; i < 1000; i++) {
        const userId = `user-${i}`;
        const deptId = `dept-${Math.floor(Math.random() * departmentNames.length)}`;
        
        users[userId] = {
            id: userId,
            firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
            lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
            departmentId: deptId,
            totalSpending: 0,
            expenseCount: 0,
        };

        departments[deptId].userCount++;

        for (let j = 0; j < 1000; j++) {
            const expenseId = `expense-${i}-${j}`;
            const cost = Math.floor(Math.random() * 500) + 20;
            expenses[expenseId] = {
                id: expenseId,
                userId: userId,
                category: expenseCategories[Math.floor(Math.random() * expenseCategories.length)],
                description: `Expense for ${users[userId].firstName}`,
                cost: cost,
            };
            users[userId].totalSpending += cost;
            users[userId].expenseCount++;
            departments[deptId].totalSpending += cost;
        }
    }

    return { departments, users, expenses };
};

