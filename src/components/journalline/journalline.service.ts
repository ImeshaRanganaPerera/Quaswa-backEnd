import { db } from "../../utils/db.server";

export const list = async () => {
    return db.journalLine.findMany();
}

export const getByAccountAndDateRange = async (chartofAccountId: string | null, startDate: Date, endDate: Date) => {
    return db.journalLine.findMany({
        where: {
            ...(chartofAccountId && { chartofAccountId }), // Apply filter only if chartofAccountId is provided
            date: {
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
            journal: {
                select: {
                    voucherNumber: true,
                    party: {
                        select: {
                            name: true
                        }
                    },
                    chartofacc: {
                        select: {
                            accountName: true
                        }
                    }
                }
            },
        },
        orderBy: {
            date: 'desc'
        }
    });
};



export const get = async (id: any) => {
    return db.journalLine.findMany({
        where: {
            voucherId: id,
        },
        include: {
            account: {
                select: {
                    accountName: true
                }
            }
        }
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

export const updateDate = async (data: any, id: any) => {
    return db.journalLine.update({
        where: { id: id },  // Correctly specifying `id` in an object
        data: { date: data.date }
    });
};

interface TrialBalanceEntry {
    accountName: string;
    groupName: string;
    debit: number;
    credit: number;
}

export const getTrialBalance = async (
    chartofAccountId: string | null,
    startDate: Date,
    endDate: Date
): Promise<TrialBalanceEntry[]> => {
    const accounts = await db.chartofAccount.findMany({
        where: {
            journalLine: {
                some: {
                    date: {
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

    const trialBalance: TrialBalanceEntry[] = [];
    let totalDebit = 0;
    let totalCredit = 0;
    let receivableDebit = 0;
    let receivableCredit = 0;
    let payableDebit = 0;
    let payableCredit = 0;

    accounts.forEach(account => {
        const accountCategory = account.AccountSubCategory?.AccountCategory?.accCategory;
        const openingBalance = account.Opening_Balance;
        const accGroup = account.accGroup?.accountGroupName || "";

        let accountDebit = 0;
        let accountCredit = 0;

        account.journalLine.forEach(journal => {
            accountDebit += (journal.debitAmount ? journal.debitAmount.toNumber() : 0);
            accountCredit += (journal.creditAmount ? journal.creditAmount.toNumber() : 0);
        });

        let calculatedDebit = 0;
        let calculatedCredit = 0;

        if (accountCategory === 'ASSETS' || accountCategory === 'EXPENCESS') {
            calculatedDebit = (openingBalance ? openingBalance.toNumber() : 0) + (accountDebit - accountCredit);
        } else if (accountCategory === 'EQUITY' || accountCategory === 'LIABILITIES' || accountCategory === 'INCOME') {
            calculatedCredit = (openingBalance ? openingBalance.toNumber() : 0) + (accountCredit - accountDebit);
        }

        if (accGroup === "Receivable") {
            receivableDebit += calculatedDebit;
            receivableCredit += calculatedCredit;
        } else if (accGroup === "Payable") {
            payableDebit += calculatedDebit;
            payableCredit += calculatedCredit;
        } else {
            trialBalance.push({
                accountName: account.accountName,
                groupName: accGroup,
                debit: calculatedDebit,
                credit: calculatedCredit
            });
        }

        totalDebit += calculatedDebit;
        totalCredit += calculatedCredit;
    });

    // Add summarized Receivable and Payable accounts
    if (receivableDebit || receivableCredit) {
        trialBalance.push({
            accountName: "Accounts Receivable",
            groupName: "Receivable",
            debit: receivableDebit,
            credit: receivableCredit
        });
    }

    if (payableDebit || payableCredit) {
        trialBalance.push({
            accountName: "Accounts Payable",
            groupName: "Payable",
            debit: payableDebit,
            credit: payableCredit
        });
    }

    return trialBalance;
};
