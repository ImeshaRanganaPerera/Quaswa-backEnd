import { db } from "../../utils/db.server";

export const getlist = async () => {
    return db.voucherProduct.findMany();
}

export const get = async (id: any) => {
    return db.voucherProduct.findFirst({
        where: {
            id,
        }
    });
}

export const create = async (data: any) => {
    return db.voucherProduct.create({
        data: data
    });
}

export const update = async (data: any, id: any) => {
    return db.voucherProduct.update({
        where: id,
        data: data
    });
}