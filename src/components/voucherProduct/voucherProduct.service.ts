import { db } from "../../utils/db.server";

export const list = async () => {
    return db.voucherProduct.findMany();
}

export const getbyVoucherId = async (id: any) => {
    return db.voucherProduct.findMany({
        where: {
            voucherId: id,
        },
        include: {
            product: true
        }
    });
}

export const getbyProductIdCenterId = async (data: any) => {
    return db.voucherProduct.findMany({
        where: {
            centerId: data.centerId,
            productId: data.productId,
            remainingQty: {
                gt: 0,
            }
        },
        include: {
            product: true
        },
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