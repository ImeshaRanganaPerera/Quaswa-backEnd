import { db } from "../../utils/db.server";

export const list = async () => {
    return db.journalLine.findMany();
}

export const getByAccountAndDateRange = async (chartofAccountId: string | null, startDate: Date, endDate: Date) => {
    return db.journalLine.findMany({
        where: {
            ...(chartofAccountId && { chartofAccountId }), // Apply filter only if chartofAccountId is provided
            createdAt: {
                gte: startDate, // greater than or equal to the start date
                lte: endDate,   // less than or equal to the end date
            },
        },
        include: {
            account: {
                select: {
                    accountName: true, // This will retrieve the account name
                },
            },
        },
    });
};



export const get = async (id: any) => {
    return db.journalLine.findUnique({
        where: {
            id,
        },
    });
}

export const getbyRef = async (name: any) => {
    return db.journalLine.findMany({
        where: {
            ref: name,
        },
        include: {
            account: {
                select: {
                    accountName: true, // This will retrieve the account name
                },
            },
        },
    });
}

export const create = async (data: any) => {
    return db.journalLine.create({
        data: data
    });
}

export const update = async (data: any, id: any) => {
    return db.journalLine.update({
        where: id,
        data: data
    });
}

export const getTrialBalance = async (chartofAccountId: string | null, startDate: Date, endDate: Date) => {
    const accBalances = await db.journalLine.findMany({
        where: {
            ...(chartofAccountId && { chartofAccountId }), 
            createdAt: { 
                lte: endDate, 
            },
            account: {
                AccountSubCategory: {
                    AccountCategory: {
                        accCategory: {
                            in: ['EQUITY', 'EXPENCESS', 'LIABILITIES', 'INCOME', 'ASSETS'],
                        }
                    }
                }
            }
        },
        include: {
            account: {
                select: {
                    accountName: true,
                    AccountSubCategory: {
                        select: {
                            AccountCategory: {
                                select: {
                                    accCategory: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    // Define the result type explicitly
    type TrialBalanceResult = {
        [accountName: string]: {
            debit: number;
            credit: number;
        };
    };

    const result: TrialBalanceResult = {};

    // Loop through all journal lines and group by account
    accBalances.forEach(journal => {
        const accountName = journal.account.accountName;
        const subCategory = journal.account?.AccountSubCategory;
        const category = subCategory?.AccountCategory?.accCategory;
        
        // Convert Decimal to number
        const debit = journal.debitAmount?.toNumber() || 0;
        const credit = journal.creditAmount?.toNumber() || 0;

        // Ensure that accountName and category are valid before processing
        if (!accountName || !category) return;

        if (!result[accountName]) {
            result[accountName] = { debit: 0, credit: 0 };
        }

        // If the category is 'ASSETS' or 'EXPENSES', calculate debit-dominant balance
        if (['ASSETS', 'EXPENCESS'].includes(category)) {
            result[accountName].debit += debit - credit;
        }
        // If the category is 'EQUITY', 'LIABILITIES', or 'INCOME', calculate credit-dominant balance
        else if (['EQUITY', 'LIABILITIES', 'INCOME'].includes(category)) {
            result[accountName].credit += credit - debit;
        }
    });

    // Format the result as an array
    const formattedResult = Object.keys(result).map(accountName => ({
        accountName,
        debit: result[accountName].debit > 0 ? result[accountName].debit : 0,
        credit: result[accountName].credit > 0 ? result[accountName].credit : 0,
    }));

    return formattedResult;
};