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
export const getByProductAndCenter = async (productId: string, centerId: string,batchNo: string) => {
    return db.inventory.findUnique({
        where: {
            productId_centerId_batchNo: {
                productId,
                centerId,
                batchNo,
            },
        },
    });
};


export const getbycenterIdProductId = async (productId: any, centerId: any,batchNo: any) => {
    return db.inventory.findFirst({
        where: {
            productId: productId,
            centerId: centerId,
            batchNo:batchNo,
        }
    })
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
                productId_centerId_batchNo: {
                    productId: data.productId,
                    centerId: data.centerId,
                    batchNo: data.batchNo,
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

        const totalQuantity = allInventory.reduce((acc, inventory) => {
            return acc.plus(new Decimal(inventory.quantity || 0));
        }, new Decimal(0));

        const oldCost = product?.cost || new Decimal(0);
        const oldqty = totalQuantity || new Decimal(0);

        const newCost = new Decimal(data.cost);
        const newqty = new Decimal(data.quantity);

        const avgCost = (oldCost.times(oldqty).plus(newCost.times(newqty))).div(oldqty.plus(newqty));

        await db.product.update({
            where: { id: product?.id },
            data: {
                cost: avgCost.toFixed(2),
                minPrice: data.minPrice,
                MRP: data.MRP,
                sellingPrice: data.sellingPrice,
            }
        });

        const newQuantity = existingInventory
            ? new Decimal(existingInventory.quantity ?? 0).plus(new Decimal(data.quantity))
            : new Decimal(data.quantity);

        return db.inventory.upsert({
            where: {
                productId_centerId_batchNo: {
                    productId: data.productId,
                    centerId: data.centerId,
                    batchNo: data.batchNo,
                },
            },
            update: {
                quantity: newQuantity,
            },
            create: {
                productId: data.productId,
                centerId: data.centerId,
                batchNo: data.batchNo,
                quantity: newQuantity,
                expDate:data.expDate,
                closingExpDate:data.closingExpDate,
            },
        });
    } else {
        const existingInventory = await db.inventory.findUnique({
            where: {
                productId_centerId_batchNo: {
                    productId: data.productId,
                    centerId: data.centerId,
                    batchNo: data.batchNo,
                },
            },
        });

        const newQuantity = existingInventory
            ? new Decimal(existingInventory.quantity ?? 0).plus(new Decimal(data.quantity))
            : new Decimal(data.quantity);

        return db.inventory.upsert({
            where: {
                productId_centerId_batchNo: {
                    productId: data.productId,
                    centerId: data.centerId,
                    batchNo: data.batchNo,
                },
            },
            update: {
                quantity: newQuantity,
            },
            create: {
                productId: data.productId,
                centerId: data.centerId,
                batchNo: data.batchNo,
                quantity: newQuantity,
                expDate:data.expDate,
                closingExpDate:data.closingExpDate,
              
            },
        });
    }
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

export const updates = async (data: any, productId: any, centerId: any,batchNo:any) => {
    return db.inventory.update({
        where: {
            productId_centerId_batchNo: {
                productId: productId,
                centerId: centerId,
                batchNo:batchNo,
            },
        },
        data: {
            quantity: data.quantity,
        },
    });
}

export const updateStatus = async (data: any, id: any) => {
    // Fetch all inventory items with the specified productId
    console.log(id)
    const inventory = await db.inventory.findMany({
        where: {
            productId: id.id,
        },
    });

    if (inventory.length > 0) {
        // Use Promise.all to wait for all updates to complete
        await Promise.all(inventory.map((item: any) => {
            return db.inventory.update({
                where: {
                    productId_centerId_batchNo: {
                        productId: item.productId,
                        centerId: item.centerId,
                        batchNo:item.batchNo,
                    },
                },
                data: data,  // Use the data passed in as an argument
            });
        }));
    }
};


export const filterVoucherProduct = async (
    productId?: string,
    centerId?: string,
   
    date: Date = new Date()
) => {
    const filterConditions: any = {
        createdAt: {
            lte: date,
        },
        stockStatus: true
    };

    if (productId) filterConditions.productId = productId;

    const voucherProducts = await db.voucherProduct.findMany({
        where: filterConditions,
        include: {
            voucher: {
                include: {
                    voucherGroup: true,
                    voucherCenter: true,
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
            if (['INVOICE', 'PURCHASE-RETURN', 'GRN', 'SALES-RETURN','STOCK-VERIFICATION'].includes(voucherGroup)) {
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
    centerId: string
) => {
    const existingProductIndex = centerProducts.findIndex(
        (item: any) =>
            item.productName === productName &&
            item.batchNo === voucherProduct.batchNo
    );

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
            centerId: centerId,
            productId: voucherProduct.product.id,
            batchNo: voucherProduct.batchNo || "",
        });
    }
};

export const getFinalQuantity = async (productId: string, centerId: string): Promise<number> => {
    const result = await filterVoucherProduct(productId, centerId);

    // Find the center by name (since filterVoucherProduct uses centerName as key)
    const centerName = Object.keys(result)[0]; // since you're filtering by centerId, only one key will exist
    const products = result[centerName] || [];

    const product = products.find((item: any) => item.productId === productId);

    if (!product) return 0;

    // Safely return as number
    return new Decimal(product.quantity || 0).toNumber();
};

export const getStockMovement = async (productId: string, centerId: string, date: Date) => {
    // Fetch stock movement based on the criteria
    console.log(productId, centerId, date);

    const stockMovements = await db.voucherProduct.findMany({
        where: {
            productId: productId,
            stockStatus: true,
            createdAt: { lte: date },
            voucher: {
                voucherGroup: {
                    voucherName: {
                        in: ['INVOICE', 'PURCHASE-RETURN', 'GRN', 'SALES-RETURN', 'STOCK-TRANSFER'],
                    },
                },
                voucherCenter: {
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
                    voucherCenter: true,
                }
            },
        },
        orderBy: {
            createdAt: 'asc'
        }
    });

    // Prepare the result based on your criteria
    // const result: any[] = [];
     const result: Record<string, any[]> = {};
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
        const batchNo = voucherProduct.batchNo || 'UNKNOWN';
if (!result[batchNo]) {
    result[batchNo] = [];
}
result[batchNo].push({
    date: date,
    printName: productName,
    voucherName: voucherGroup,
    voucherNumber: voucherNumber,
    partyName: partyName,
    qtyIn: qtyIn.toNumber(),
    qtyOut: qtyOut.toNumber(),
    mrp: mrp.toNumber(),
    cost: cost.toNumber(),
    centerId: centerId,
    batchNo: batchNo
});

        // result.push({
        //     date: date,
        //     printName: productName,
        //     voucherName: voucherGroup,
        //     voucherNumber: voucherNumber,
        //     partyName: partyName,
        //     qtyIn: qtyIn.toNumber(), // Convert Decimal to number for the response
        //     qtyOut: qtyOut.toNumber(), // Convert Decimal to number for the response
        //     mrp: mrp.toNumber(), // Convert Decimal to number for the response
        //     cost: cost.toNumber(), // Convert Decimal to number for the response
        //     centerId: centerId,
        //     batchNo: voucherProduct.batchNo || ''
        // });
    });

    return result;
};