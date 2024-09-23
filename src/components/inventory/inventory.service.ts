import { Decimal } from "@prisma/client/runtime/library";
import { db } from "../../utils/db.server";

export const getlist = async () => {
    return db.inventory.findMany();
}

export const getbyCenter = async (id: any) => {
    return db.inventory.findMany({
        where: {
            centerId: id,
            status: true,
        },
        include: {
            product: true,
        },
    });
}

export const upsert = async (data: any) => {
    const existingInventory = await db.inventory.findUnique({
        where: {
            productId_centerId: {
                productId: data.productId,
                centerId: data.centerId
            }
        },
    });

    let newQuantity: Decimal;
    if (existingInventory && existingInventory.quantity !== null) {
        newQuantity = new Decimal(existingInventory.quantity).plus(new Decimal(data.quantity));
    } else {
        newQuantity = new Decimal(data.quantity);
    }

    return db.inventory.upsert({
        where: {
            productId_centerId: {
                productId: data.productId,
                centerId: data.centerId
            }
        },
        update: {
            quantity: newQuantity, // Update with the calculated new quantity
        },
        create: {
            productId: data.productId,
            centerId: data.centerId,
            quantity: newQuantity, // Insert the original quantity on creation
        },
    });
};


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
