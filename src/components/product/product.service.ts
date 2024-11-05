import { db } from "../../utils/db.server";

export const list = async () => {
    return db.product.findMany({
        include: {
            OEMNumber: true,
            productDiscountLevel: true
        },
    });
}

export const get = async (id: any) => {
    return db.product.findUnique({
        where: {
            id,
        },
    });
}

export const create = async (data: any) => {
    return db.product.create({
        data: data
    });
}


export const update = async (data: any, id: any) => {
    return db.product.update({
        where: { id },
        data: data
    });
}

export const updatePrices = async (data: any, id: any) => {
    return db.product.update({
        where: id,
        data: data,
        include: {
            OEMNumber: true,
            productDiscountLevel: true,
        }
    });
}

export const updatePricesbulk = async (data: any, id: any) => {
    return db.product.update({
        where: { id },
        data: data,
    });
}

export const updateStatus = async (data: any, id: any) => {
    return db.product.update({
        where: id,
        data: data,
    });
}

export const getAllProductsWithDynamicDiscounts = async () => {
    return db.product.findMany({
        select: {
            printName: true,
            cost: true,
            MRP: true,
            productDiscountLevel: {
                include: {
                    discountLevel: true, // Fetch the discount level names
                },
                orderBy: {
                    discountLevel: {
                        createdAt: 'asc', // Order by `createdAt` field in ascending order
                    },
                },
            },
        },
    });
};
