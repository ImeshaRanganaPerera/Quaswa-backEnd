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