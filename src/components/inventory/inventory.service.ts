import { Decimal } from "@prisma/client/runtime/library";
import { db } from "../../utils/db.server";
import { startOfDay, endOfDay } from 'date-fns';

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

export const filterInventory = async (productId: string | null, centerId: string | null, specificDate: string | null) => {
    let dateFilter = {
        createdAt: {
            gte: startOfDay(new Date()), // Default to today's date
            lte: endOfDay(new Date()),   // Default to today's date
        }
    };

    if (specificDate) {
        dateFilter = {
            createdAt: {
                gte: startOfDay(new Date(specificDate)),
                lte: endOfDay(new Date(specificDate)),
            }
        };
    }

    return db.inventory.findMany({
        where: {
            ...(productId ? { productId: productId } : {}),
            ...(centerId ? { centerId: centerId } : {}),
            status: true,
            ...dateFilter
        },
        include: {
            product: true,
            center: true,
        },
    });
};

// Calculate the total quantity based on filtering by product, center, and specific date
export const calculateTotalQuantity = async (productId: string | null, centerId: string | null, specificDate: string | null) => {
    const inventories = await filterInventory(productId, centerId, specificDate);

    const totalQuantity = inventories.reduce((total: Decimal, inventory: any) => {
        return total.plus(new Decimal(inventory.quantity || 0));
    }, new Decimal(0));

    return {
        totalQuantity,
        inventories,
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


