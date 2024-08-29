import { db } from "../../utils/db.server";

export const getlist = async () => {
    return db.inventory.findMany();
}

export const get = async (id: any) => {
    return db.inventory.findFirst({
        where: {
            centerId: id,
        }
    });
}

export const upsert = async (data: any) => {
    return db.inventory.upsert({
        where: {
            productId_centerId: {
                productId: data.productId,
                centerId: data.centerId
            }
        },
        update: {
            quantity: data.quantity,
            cost: data.cost,
            minPrice: data.minPrice,
            MRP: data.MRP,
            salePrice: data.salePrice
        },
        create: {
            productId: data.productId,
            centerId: data.centerId,
            quantity: data.quantity,
            cost: data.cost,
            minPrice: data.minPrice,
            MRP: data.MRP,
            salePrice: data.salePrice
        },
    });
}


export const create = async (data: any) => {
    return db.inventory.create({
        data: data
    });
}

export const update = async (data: any, id: any) => {
    return db.inventory.update({
        where: id,
        data: data
    });
}