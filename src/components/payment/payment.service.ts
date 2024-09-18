import { db } from "../../utils/db.server";

export const list = async () => {
    return db.payment.findMany();
}

export const getbyname = async (name: any) => {
    return db.payment.findFirst({
        where: { type: name }
    });
}

export const create = async (data: any) => {
    return db.payment.create({
        data: data
    });
}

export const update = async (data: any, id: any) => {
    return db.payment.update({
        where: id,
        data: data
    });
}