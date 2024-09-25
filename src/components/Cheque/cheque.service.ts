import { db } from "../../utils/db.server";

export const list = async () => {
    return db.cheque.findMany();
}

export const get = async (id: string) => {
    return db.cheque.findUnique({
        where: {
            id,
        }
    });
}

export const create = async (data: any) => {
    return db.cheque.create({
        data: data
    });
}

export const update = async (data: any, id: any) => {
    return db.cheque.update({
        where: id,
        data: data
    });
}

export const getNextChequeNumber = async (chartOfAccountId: string) => {
    // Step 1: Find a ChequeBook with remaining cheques and matching chartOfAccountId
    let chequeBook = await db.chequeBook.findFirst({
        where: {
            remainingCheques: {
                gt: 0 // Ensure there are remaining cheques
            },
            chartofAccountId: chartOfAccountId // Filter by chart of account ID
        },
        include: {
            Cheque: true // Include associated Cheque records
        }
    });

    // If no cheque book found with remaining cheques, return an error
    if (!chequeBook) {
        throw new Error("No cheque books available with remaining cheques for the specified account.");
    }

    // Step 2: Get all used cheque numbers
    const usedChequeNumbers = chequeBook.Cheque.map(cheque => cheque.chequeNumber);

    // Step 3: Determine the next cheque number
    const startNumber = parseInt(chequeBook.startNumber, 10);
    let nextChequeNumber = startNumber;

    // Check for used cheques and find the next available number
    while (usedChequeNumbers.includes(nextChequeNumber.toString())) {
        nextChequeNumber++;
    }

    // Optionally, update the remaining cheques count if necessary
    // await db.chequeBook.update({
    //     where: { id: chequeBook.id },
    //     data: { remainingCheques: chequeBook.remainingCheques - 1 }
    // });

    return { nextNumber: nextChequeNumber, chequeBookId: chequeBook.id }
};
