import { db } from "../../utils/db.server";

export const list = async () => {
    return db.discountLevel.findMany();
}

export const get = async (id: any) => {
    return db.discountLevel.findUnique({
        where: {
            id,
        }
    });
}

export const create = async (data: any) => {
    return db.discountLevel.create({
        data: data
    });
}

export const update = async (data: any, id: any) => {
    return db.discountLevel.update({
        where: id,
        data: data
    });
}