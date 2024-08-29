import { db } from "../../utils/db.server";

export const list = async () => {
    return db.type.findMany();
}

export const get = async (id: any) => {
    return db.type.findUnique({
        where: {
            id,
        },
    });
}

export const create = async (data: any) => {
    return db.type.create({
        data: data
    });
}

export const update = async (data: any, id: any) => {
    return db.type.update({
        where: id,
        data: data
    });
}