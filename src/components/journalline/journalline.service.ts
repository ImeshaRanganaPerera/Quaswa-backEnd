import { db } from "../../utils/db.server";

export const list = async () => {
    return db.journalLine.findMany();
}

export const getByAccountAndDateRange = async (chartofAccountId: string | null, startDate: Date, endDate: Date) => {
    return db.journalLine.findMany({
        where: {
            ...(chartofAccountId && { chartofAccountId }), // Apply filter only if chartofAccountId is provided
            date: {
                gte: startDate,
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

export const getByAccountAndDate = async (chartofAccountId: string | null, endDate: Date) => {
    return db.journalLine.findMany({
        where: {
            ...(chartofAccountId && { chartofAccountId }),
            date: {
                lte: endDate,
            },
            isStatus: false,
        },
        include: {
            account: {
                select: {
                    accountName: true,
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
        where: { id: id },
        data: { date: data.date }
    });
};

export const updateStatus = async (data: any, id: any) => {
    return db.journalLine.update({
        where: { id: id },
        data: { isStatus: data.isStatus }
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


export const getProfitAndLoss = async (
    startDate: Date,
    endDate: Date
) => {
    const accounts = await db.chartofAccount.findMany({
        where: {
            AccountSubCategory: {
                AccountCategory: {
                    accCategory: {
                        in: ['INCOME', 'EXPENCESS'],
                    },
                },
            },
        },
        include: {
            accGroup: true,
            AccountSubCategory: {
                select: {
                    AccountCategory: true,
                },
            },
            journalLine: {
                where: {
                    date: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
            },
        },
    });

    // Explicit type for the accumulator
    interface AccountGroup {
        accountName: string;
        totalCreditAmount: number;
        totalDebitAmount: number;
    }

    interface ResultType {
        expencess: Record<string, AccountGroup[]>;
        income: Record<string, AccountGroup[]>;
    }

    const result: ResultType = accounts.reduce((acc: ResultType, account) => {
        if (!account.AccountSubCategory || !account.AccountSubCategory.AccountCategory) {
            return acc; // Skip invalid accounts
        }

        const category =
            account.AccountSubCategory.AccountCategory.accCategory === 'INCOME'
                ? 'income'
                : 'expencess';

        const groupName = account.accGroup?.accountGroupName || 'Unknown Group';

        const totalCreditAmount = account.journalLine.reduce(
            (sum: number, line: any) => sum + Number(line.creditAmount || 0),
            0
        );

        const totalDebitAmount = account.journalLine.reduce(
            (sum: number, line: any) => sum + Number(line.debitAmount || 0),
            0
        );

        if (!acc[category][groupName]) {
            acc[category][groupName] = [];
        }

        acc[category][groupName].push({
            accountName: account.accountName || 'Unknown Account',
            totalCreditAmount,
            totalDebitAmount,
        });

        return acc;
    }, { expencess: {}, income: {} });

    // Transform result into the desired format
    const formatResult = Object.entries(result).map(([key, groups]) => ({
        [key]: Object.entries(groups as Record<string, AccountGroup[]>).map(
            ([groupName, values]) => {
                const sumCreditTotal = values.reduce(
                    (sum, value) => sum + value.totalCreditAmount,
                    0
                );
                const sumDebitTotal = values.reduce(
                    (sum, value) => sum + value.totalDebitAmount,
                    0
                );

                return {
                    accountGroupName: groupName,
                    values,
                    sumCreditTotal,
                    sumDebitTotal,
                };
            }
        ),
    }));

    return formatResult;
};




