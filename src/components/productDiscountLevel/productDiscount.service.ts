import { db } from "../../utils/db.server";
import { upsert } from '../inventory/inventory.service';

export const list = async () => {
    return db.productDiscountLevel.findMany({

    });
}

// export const get = async (id: any) => {
//     return db.productDiscountLevel.findUnique({
//         where: {

//         },
//     });
// }

export const create = async (data: any) => {
    return db.productDiscountLevel.create({
        data: data
    });
}


export const update = async (data: any, id: any) => {
    return db.productDiscountLevel.update({
        where: {
            productId_discountLevelId: {
                productId: id,
                discountLevelId: data.discountLevelId,
            }
        },
        data: data
    });
}

export const upserts = async (data: any, productId: string) => {
    return db.productDiscountLevel.upsert({
        where: { productId_discountLevelId: { productId: productId, discountLevelId: data.discountLevelId } },
        update: {
            discountRate: data.discountRate
        },
        create: {
            productId: productId,
            discountLevelId: data.discountLevelId,
            discountRate: data.discountRate,
            createdBy: data.createdBy
        }
    });
};