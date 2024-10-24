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

interface TrialBalanceEntry {
    accountName: string;
    debit: number;
    credit: number;
}

export const getTrialBalance = async (chartofAccountId: string | null, startDate: Date, endDate: Date): Promise<TrialBalanceEntry[]> => {
    const accounts = await db.chartofAccount.findMany({
        where: {
            journalLine: {
                some: {
                    createdAt: {
                        lte: endDate,
                    }
                }
            }
        },
        include: {
            accGroup: true,
            AccountSubCategory: {
                select: {
                    AccountCategory: true,
                }
            },
            journalLine: true,
        }
    });

    // Specify the type of trialBalance as an array of TrialBalanceEntry
    const trialBalance: TrialBalanceEntry[] = [];

    accounts.forEach(account => {
        const accountCategory = account.AccountSubCategory?.AccountCategory?.accCategory;
        const openingBalance = account.Opening_Balance;

        let totalDebit: number = 0;
        let totalCredit: number = 0;

        account.journalLine.forEach(journal => {
            totalDebit += (journal.debitAmount ? journal.debitAmount.toNumber() : 0);
            totalCredit += (journal.creditAmount ? journal.creditAmount.toNumber() : 0);
        });

        let debit = 0;
        let credit = 0;

        if (accountCategory === 'ASSETS' || accountCategory === 'EXPENCESS') {
            debit = (openingBalance ? openingBalance.toNumber() : 0) + (totalDebit - totalCredit);
        } else if (accountCategory === 'EQUITY' || accountCategory === 'LIABILITIES' || accountCategory === 'INCOME') {
            credit = (openingBalance ? openingBalance.toNumber() : 0) + (totalCredit - totalDebit);
        }

        trialBalance.push({
            accountName: account.accountName,
            debit: debit,
            credit: credit
        });
    });

    return trialBalance;
};