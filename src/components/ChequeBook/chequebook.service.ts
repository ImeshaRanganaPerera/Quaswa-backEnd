import { db } from "../../utils/db.server";

export const list = async () => {
    return db.chequeBook.findMany();
}

export const get = async (id: any) => {
    return db.chequeBook.findUnique({
        where: {
            id,
        }
    });
}

export const create = async (data: any) => {
    return db.chequeBook.create({
        data: data
    });
}

export const update = async (data: any, id: any) => {
    return db.chequeBook.update({
        where: id,
        data: data
    });
}

export const updatechequeRemaning = async (id: any) => {
    const checkbook = await db.chequeBook.findFirst({
        where: {
            id: id,
            remainingCheques: {
                gt: 0 // Ensure there are remaining cheques
            },
        }
    })

    if (!checkbook || checkbook.remainingCheques === undefined) {
        throw new Error("Cheque book not found or remaining cheques value is undefined.");
    }

    await db.chequeBook.update({
        where: { id: checkbook.id },
        data: { remainingCheques: checkbook.remainingCheques - 1 }
    });
}