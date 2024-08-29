import { db } from "../../utils/db.server";

export const list = async () => {
    return db.party.findMany();
}

export const get = async (id: any) => {
    return db.party.findUnique({
        where: {
            id,
        },
    });
}

export const create = async (data: any) => {
    return db.party.create({
        data: data
    });
}

export const update = async (data: any, id: any) => {
    return db.party.update({
        where: id,
        data: data
    });
}