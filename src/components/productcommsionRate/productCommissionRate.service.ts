import { db } from "../../utils/db.server";

export const list = async () => {
    return db.productcommissionRate.findMany({

    });
}

export const get = async (id: any) => {
    return db.productcommissionRate.findMany({
        where: {
            commissionRateId: id
        },
    });
}

export const create = async (data: any) => {
    return db.productcommissionRate.create({
        data: data
    });
}


export const update = async (data: any, id: any) => {
    return db.productcommissionRate.update({
        where: {
            productId_commissionRateId: {
                productId: id,
                commissionRateId: data.discountLevelId,
            }
        },
        data: data
    });
}

export const upserts = async (data: any, productId: string) => {
    return db.productcommissionRate.upsert({
        where: { productId_commissionRateId: { productId: productId, commissionRateId: data.commissionRateId } },
        update: {
            commissionRate: data.commissionRate
        },
        create: {
            productId: productId,
            commissionRateId: data.commissionRateId,
            commissionRate: data.commissionRate,
            createdBy: data.createdBy
        }
    });
};

