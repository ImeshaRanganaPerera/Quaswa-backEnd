import { db } from "../../utils/db.server";

export const getlist = async () => {
    return db.center.findMany();
}

export const get = async (id: any) => {
    return db.center.findUnique({
        where: {
            id,
        }
    });
}

export const getCenterMode = async (mode: any) => {
    return db.center.findMany({
        where: { mode: mode }
    });
}

export const create = async (data: any) => {
    return db.center.create({
        data: data
    });
}

export const update = async (data: any, id: any) => {
    return db.center.update({
        where: id,
        data: data
    });
}