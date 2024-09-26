import { db } from "../../utils/db.server";

export const list = async () => {
    return db.journalLine.findMany();
}

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