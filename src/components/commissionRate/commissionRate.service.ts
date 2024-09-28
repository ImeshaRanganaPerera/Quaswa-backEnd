import { db } from "../../utils/db.server";

export const list = async () => {
    return db.commissionLevel.findMany();
}

export const get = async (id: any) => {
    return db.commissionLevel.findUnique({
        where: {
            id,
        }
    });
}

export const create = async (data: any) => {
    return db.commissionLevel.create({
        data: data
    });
}

export const update = async (data: any, id: any) => {
    return db.commissionLevel.update({
        where: id,
        data: data
    });
}