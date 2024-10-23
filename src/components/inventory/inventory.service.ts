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

export const updates = async (data: any, productId: any, centerId: any) => {
    return db.inventory.update({
        where: {
            productId_centerId: {
                productId: productId,
                centerId: centerId,
            },
        },
        data: {
            quantity: data.quantity,
        },
    });
}


export const filterVoucherProduct = async (
    productId?: string,
    centerId?: string,
    date: Date = new Date()
) => {
    const filterConditions: any = {
        createdAt: {
            lte: date,
        },
    };

    if (productId) filterConditions.productId = productId;

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

    const result: Record<string, any[]> = {};

    // Fetch centers for lookup by their IDs
    const centerIds = [...new Set(voucherProducts.map(vp => vp.toCenterId).filter(id => id !== null))]; // Get unique toCenterIds
    const centers = await db.center.findMany({
        where: {
            id: { in: centerIds },
        },
    });
    const centerMap = new Map(centers.map(center => [center.id, center.centerName]));

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
                addOrUpdateProduct(result[centerName], productName, quantity.neg(), voucherProduct, voucherProduct.centerId as string); // Cast to string
            }
            // Add quantity to the destination center
            if (voucherProduct.toCenterId) {
                const toCenterName = centerMap.get(voucherProduct.toCenterId) || 'Unknown'; // Get destination center name
                if (!result[toCenterName]) {
                    result[toCenterName] = [];
                }
                addOrUpdateProduct(result[toCenterName], productName, quantity, voucherProduct, voucherProduct.toCenterId as string); // Cast to string
            }
        } else {
            if (['INVOICE', 'PURCHASE-RETURN', 'GRN', 'SALES-RETURN'].includes(voucherGroup)) {
                if (!result[centerName]) {
                    result[centerName] = [];
                }
                const adjustedQuantity = ['INVOICE', 'PURCHASE-RETURN'].includes(voucherGroup) ? quantity.neg() : quantity;

                // Ensure centerId is not null
                if (voucherProduct.centerId) {
                    addOrUpdateProduct(result[centerName], productName, adjustedQuantity, voucherProduct, voucherProduct.centerId as string); // Cast to string
                }
            }
        }
    });

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
    voucherProduct: any,
    centerId: string // centerId should be a string
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
            centerId: centerId,  // Add centerId to the response
            productId: voucherProduct.product.id, // Add productId to the response
        });
    }
};

export const getStockMovement = async (productId: string, centerId: string, date: Date) => {
    // Fetch stock movement based on the criteria
    console.log(productId, centerId, date);

    const stockMovements = await db.voucherProduct.findMany({
        where: {
            productId: productId,
            createdAt: { lte: date },
            voucher: {
                voucherGroup: {
                    voucherName: {
                        in: ['INVOICE', 'PURCHASE-RETURN', 'GRN', 'SALES-RETURN', 'STOCK-TRANSFER'],
                    },
                },
                VoucherCenter: {
                    some: {
                        centerId: centerId
                    }
                }
            }
        },
        include: {
            product: true,
            voucher: {
                include: {
                    voucherGroup: true,
                    party: true,
                    VoucherCenter: true,
                }
            },
        },
        orderBy: {
            createdAt: 'asc'
        }
    });

    // Prepare the result based on your criteria
    const result: any[] = [];

    stockMovements.forEach((voucherProduct) => {
        const voucherGroup = voucherProduct.voucher.voucherGroup.voucherName;
        const date = voucherProduct.voucher.date;

        // Check if VoucherCenter has a center and retrieve its name
        const productName = voucherProduct.product.printName || 'Unknown Product';

        let qtyIn = new Decimal(0);
        let qtyOut = new Decimal(0);
        const mrp = new Decimal(voucherProduct.product.MRP || 0);
        const cost = new Decimal(voucherProduct.product.cost || 0);
        const voucherNumber = voucherProduct.voucher.voucherNumber;
        const partyName = voucherProduct.voucher.party?.name || '-';

        // Determine qty In and qty Out based on the voucherGroup
        if (['GRN', 'SALES-RETURN'].includes(voucherGroup)) {
            qtyIn = qtyIn.plus(voucherProduct.quantity);
        } else if (['INVOICE', 'PURCHASE-RETURN'].includes(voucherGroup)) {
            qtyOut = qtyOut.plus(voucherProduct.quantity);
        } else if (voucherGroup === 'STOCK-TRANSFER') {
            // Check if the centerId matches
            if (voucherProduct.centerId === centerId) {
                qtyOut = qtyOut.plus(voucherProduct.quantity);
            }
            // Check if the toCenterId matches
            if (voucherProduct.toCenterId === centerId) {
                qtyIn = qtyIn.plus(voucherProduct.quantity);
            }
        }

        // Add the record to the result array
        result.push({
            date: date,
            printName: productName,
            voucherName: voucherGroup,
            voucherNumber: voucherNumber,
            partyName: partyName,
            qtyIn: qtyIn.toNumber(), // Convert Decimal to number for the response
            qtyOut: qtyOut.toNumber(), // Convert Decimal to number for the response
            mrp: mrp.toNumber(), // Convert Decimal to number for the response
            cost: cost.toNumber(), // Convert Decimal to number for the response
            centerId: centerId
        });
    });

    return result;
};








