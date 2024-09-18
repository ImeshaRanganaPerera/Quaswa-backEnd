import { db } from "../../utils/db.server";

export const list = async () => {
    return db.paymentVoucher.findMany();
}

export const getbyVoucherId = async (id: any) => {
    return db.paymentVoucher.findMany({
        where: {
            voucherId: id,
        },
    });
}

export const createMany = async (data: any[]) => {
    return db.paymentVoucher.createMany({
        data: data
    });
}

export const create = async (data: any) => {
    return db.paymentVoucher.create({
        data: data
    });
}

export const update = async (data: any, id: any) => {
    return db.paymentVoucher.update({
        where: id,
        data: data
    });
}