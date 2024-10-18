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

// Filter inventory based on productId, centerId, and date with 0 qty
export const filterInventory = async (productId?: string, centerId?: string) => {
    const filterConditions: any = { status: true };

    // Apply filters based on productId and centerId
    if (productId) filterConditions.productId = productId;
    if (centerId) filterConditions.centerId = centerId;

    // Fetch inventory list filtered by productId and/or centerId
    const inventories = await db.inventory.findMany({
        where: filterConditions,
        include: {
            product: true,
            center: true,
        },
    });

    // Prepare the formatted result
    const formattedInventory = inventories.map((inventory) => ({
        printName: inventory.product.printName || inventory.product.productName, // Use printName if available, otherwise productName
        qty: new Decimal(inventory.quantity || 0).toNumber(), // Quantity as a number
        mrp: new Decimal(inventory.product.MRP || 0).toNumber(), // MRP as a number
        cost: new Decimal(inventory.product.cost || 0).toNumber(), // Cost as a number
        centerName: inventory.center.centerName, // Center name
    }));

    // Calculate the total quantity across inventories
    let totalQuantity: Decimal = new Decimal(0);
    formattedInventory.forEach((inventory) => {
        totalQuantity = totalQuantity.plus(new Decimal(inventory.qty));
    });

    return {
        inventories: formattedInventory,
        totalQuantity: totalQuantity.toNumber(),
    };
};

export const upsert = async (data: any) => {
    if (data.cost) {
        const existingInventory = await db.inventory.findUnique({
            where: {
                productId_centerId: {
                    productId: data.productId,
                    centerId: data.centerId,
                },
            },
        });

        const product = await db.product.findFirst({
            where: {
                id: data.productId,
            }
        });

        const allInventory = await db.inventory.findMany({
            where: {
                productId: data.productId,
            },
        });
        console.log(allInventory)

        const totalQuantity = allInventory.reduce((acc, inventory) => {
            return acc.plus(new Decimal(inventory.quantity || 0)); // Use Decimal for precise addition
        }, new Decimal(0));

        console.log(`Total quantity for product ${data.productId}:`, totalQuantity.toString());

        const oldCost = product?.cost || new Decimal(0);
        const oldqty = totalQuantity || new Decimal(0);

        const newCost = new Decimal(data.cost);
        const newqty = new Decimal(data.quantity);

        const avgCost = (oldCost.times(oldqty).plus(newCost.times(newqty))).div(oldqty.plus(newqty));

        const updateCostproduct = await db.product.update({
            where: {
                id: product?.id,
            },
            data: {
                cost: avgCost,
                minPrice: data.minPrice,
                MRP: data.MRP,
                sellingPrice: data.sellingPrice,
            }
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
    }
    else {
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


export const filterVoucherProduct = async (
    productId?: string,
    centerId?: string,
    date: Date = new Date()
) => {
    const filterConditions: any = {
        createdAt: {
            lte: date, // Get vouchers created up to the specified date
        },
    };

    if (productId) filterConditions.productId = productId;
    // Remove the direct centerId filter here; instead, we'll filter later
    console.log('Filter Conditions:', filterConditions);

    const voucherProducts = await db.voucherProduct.findMany({
        where: filterConditions,
        include: {
            voucher: {
                include: {
                    voucherGroup: true,
                    VoucherCenter: true,
                },
            },
            product: true,
            center: true,
        },
    });

    console.log('Fetched Voucher Products:', voucherProducts);

    const result: Record<string, any[]> = {};

    // Fetch centers for lookup by their IDs
    const centerIds = [...new Set(voucherProducts.map(vp => vp.toCenterId).filter(id => id !== null))]; // Get unique toCenterIds
    const centers = await db.center.findMany({
        where: {
            id: { in: centerIds },
        },
    });
    const centerMap = new Map(centers.map(center => [center.id, center.centerName]));
    console.log('Center Map:', Array.from(centerMap.entries()));

    // Calculate quantities for each voucher product
    voucherProducts.forEach((voucherProduct) => {
        const voucherGroup = voucherProduct.voucher.voucherGroup.voucherName;
        const centerName = voucherProduct.center?.centerName || 'Unknown';
        const productName = voucherProduct.product.printName || 'Unknown Product'; // Ensure productName is always a string

        // Ensure quantity is treated as Decimal
        let quantity = new Decimal(voucherProduct.quantity);

        // Handle stock transfer
        if (voucherGroup === 'STOCK-TRANSFER') {
            // Deduct quantity from the source center
            if (voucherProduct.centerId) {
                if (!result[centerName]) {
                    result[centerName] = [];
                }
                addOrUpdateProduct(result[centerName], productName, quantity.neg(), voucherProduct);
            }
            // Add quantity to the destination center
            if (voucherProduct.toCenterId) {
                const toCenterName = centerMap.get(voucherProduct.toCenterId) || 'Unknown'; // Get destination center name
                if (!result[toCenterName]) {
                    result[toCenterName] = [];
                }
                addOrUpdateProduct(result[toCenterName], productName, quantity, voucherProduct);
            }
        } else {
            if (['INVOICE', 'PURCHASE-RETURN', 'GRN', 'SALES-RETURN'].includes(voucherGroup)) {
                if (!result[centerName]) {
                    result[centerName] = [];
                }
                const adjustedQuantity = ['INVOICE', 'PURCHASE-RETURN'].includes(voucherGroup) ? quantity.neg() : quantity;
                addOrUpdateProduct(result[centerName], productName, adjustedQuantity, voucherProduct);
            }
        }
    });

    console.log('Result before filtering:', result);

    // Filter the result to return only the specified center if centerId is provided
    if (centerId) {
        const centerName = centerMap.get(centerId);
        if (centerName) {
            return { [centerName]: result[centerName] || [] }; // Only return the specific center
        } else {
            console.warn('No center found for centerId:', centerId);
            return {}; // Return empty if the centerId does not exist in the map
        }
    }

    return result;
};

// Helper function to add or update product in the result array
const addOrUpdateProduct = (
    centerProducts: any[],
    productName: string,
    quantity: Decimal,
    voucherProduct: any
) => {
    const existingProductIndex = centerProducts.findIndex((item: any) => item.productName === productName);

    if (existingProductIndex > -1) {
        const existingProduct = centerProducts[existingProductIndex];
        existingProduct.quantity = new Decimal(existingProduct.quantity).plus(quantity);
        existingProduct.cost = new Decimal(voucherProduct.product.cost || 0);
        existingProduct.MRP = new Decimal(voucherProduct.product.MRP || 0);
    } else {
        centerProducts.push({
            productName: productName,
            MRP: new Decimal(voucherProduct.product.MRP || 0),
            cost: new Decimal(voucherProduct.product.cost || 0),
            quantity: quantity,
        });
    }
};






