import { db } from "../../utils/db.server";

export const list = async () => {
    return db.accountCategory.findMany();
}

export const get = async (id: any) => {
    return db.accountCategory.findUnique({
        where: {
            id,
        },
    });
}

export const create = async (data: any) => {
    return db.accountCategory.create({
        data: data,
       
    });
}

export const update = async (data: any, id: any) => {
    return db.accountCategory.update({
        where: id,
        data: data
    });
}