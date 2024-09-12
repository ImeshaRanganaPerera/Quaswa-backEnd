import { db } from "../../utils/db.server";

export const list = async () => {
    return db.accountGroup.findMany();
}

export const get = async (id: any) => {
    return db.accountGroup.findUnique({
        where: {
            id,
        },
    });
}

export const create = async (data: any) => {
    return db.accountGroup.create({
        data: data
    });
}

export const update = async (data: any, id: any) => {
    return db.accountGroup.update({
        where: id,
        data: data
    });
}