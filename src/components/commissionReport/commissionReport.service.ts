import { db } from "../../utils/db.server";

export const list = async () => {
    return db.commissionReport.findMany();
}

export const get = async (id: any) => {
    return db.commissionReport.findUnique({
        where: {
            id,
        }
    });
}

export const create = async (data: any) => {
    return db.commissionReport.create({
        data: data
    });
}

export const update = async (data: any, id: any) => {
    return db.commissionReport.update({
        where: id,
        data: data
    });
}