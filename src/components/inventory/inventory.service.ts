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

export const getbyProductId = async (id: any) => {
    return db.inventory.findMany({
        where: {
            productId: id,
        }
    });
}

export const filterInventory = async (productId?: string, centerId?: string, date?: string) => {
    const filterConditions: any = {
        status: true,
    };

    // Filtering conditions based on productId and centerId
    if (productId) {
        filterConditions.productId = productId;
    }

    if (centerId) {
        filterConditions.centerId = centerId;
    }

    console.log("Filter Conditions:", filterConditions);

    // Fetch inventory list filtered by productId and/or centerId
    const inventories = await db.inventory.findMany({
        where: filterConditions,
        include: {
            product: true,
            center: true,
        },
    });

    console.log("Inventories fetched:", inventories);

    // Calculate total quantity for the specified date
    const currentDate = new Date();
    const filterDate = date ? new Date(date) : currentDate;

    const dateStart = new Date(filterDate.setHours(0, 0, 0, 0));
    const dateEnd = new Date(filterDate.setHours(23, 59, 59, 999));

    const inventoriesOnDate = await db.inventory.findMany({
        where: {
            status: true,
            updatedAt: {
                gte: dateStart,
                lt: dateEnd,
            },
        },
    });

    console.log("Inventories on date:", inventoriesOnDate);

    let totalQuantity: Decimal = new Decimal(0);
    inventoriesOnDate.forEach((inventory) => {
        if (inventory.quantity) {
            totalQuantity = totalQuantity.plus(new Decimal(inventory.quantity));
        }
    });

    return {
        inventories,
        totalQuantity,
    };
};

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


