import { db } from "../../utils/db.server";

export const list = async () => {
    return db.cheque.findMany();
}

export const get = async (id: any) => {
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