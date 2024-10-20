import { db } from "../../utils/db.server";
import Decimal from 'decimal.js';

export const list = async () => {
    return db.chartofAccount.findMany({
        include: {
            accGroup: true,
            AccountSubCategory: true
        }
    });
}

export const get = async (id: any) => {
    return db.chartofAccount.findUnique({
        where: {
            id,
        },

    });
}

export const getbyname = async (name: string) => {
    return db.chartofAccount.findFirst({
        where: {
            accountName: name

        }
    })
}

export const getbygroup = async (id: string) => {
    return db.chartofAccount.findMany({
        where: {
            accountGroupId: id,
            NOT: {
                accountName: { in: ['EXPENCESS ACCOUNT', 'USER EXPENCESS ACCOUNT'] }
            }
        }
    })
}

export const getdepositAcc = async () => {
    return db.chartofAccount.findMany({
        where: {
            accGroup: {
                accountGroupName: { in: ['Cash & Cash Equivalents', 'Bank'] }
            }
        },
        include: {
            accGroup: true
        }
    })
}

export const create = async (data: any) => {
    return db.chartofAccount.create({
        data: data,
        include: {
            accGroup: true,
            AccountSubCategory: true
        }
    });
}

export const updates = async (data: any, id: any) => {
    return db.chartofAccount.update({
        where: { id },
        data: data,
        include: {
            accGroup: true,
            AccountSubCategory: true
        }
    });
}

export const update = async (data: any, id: any) => {
    console.log(data)
    return db.chartofAccount.update({
        where: id,
        data: data,
        include: {
            accGroup: true,
            AccountSubCategory: true
        }
    });
}

export const sumbalance = async (id: any) => {
    // Find the account's opening balance
    const account = await db.chartofAccount.findUnique({
        where: { id: id },
        select: { Opening_Balance: true }
    });

    // Get the sum of debits and credits
    const { _sum } = await db.journalLine.aggregate({
        where: { chartofAccountId: id },
        _sum: {
            debitAmount: true,
            creditAmount: true
        }
    });

    // Convert Opening_Balance to Decimal
    const openingBalance = new Decimal(account?.Opening_Balance || 0);
    const totalDebits = new Decimal(_sum.debitAmount || 0);
    const totalCredits = new Decimal(_sum.creditAmount || 0);

    // Calculate balance using Decimal arithmetic
    const balance = openingBalance.plus(totalDebits).minus(totalCredits);

    return balance.toNumber(); // Convert back to a regular number if needed
};
