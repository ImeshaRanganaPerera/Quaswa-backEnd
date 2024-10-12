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

// Filter inventory based on productId, centerId, and date
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

    // Prepare the formatted result excluding inventories with 0 quantity
    const formattedInventory = inventories
        .filter((inventory) => new Decimal(inventory.quantity || 0).greaterThan(0)) // Filter out 0 quantity
        .map((inventory) => ({
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

// Filter inventory based on productId, centerId, and date with 0 qty
// export const filterInventory = async (productId?: string, centerId?: string) => {
//     const filterConditions: any = { status: true };

//     // Apply filters based on productId and centerId
//     if (productId) filterConditions.productId = productId;
//     if (centerId) filterConditions.centerId = centerId;

//     // Fetch inventory list filtered by productId and/or centerId
//     const inventories = await db.inventory.findMany({
//         where: filterConditions,
//         include: {
//             product: true,
//             center: true,
//         },
//     });

//     // Prepare the formatted result
//     const formattedInventory = inventories.map((inventory) => ({
//         printName: inventory.product.printName || inventory.product.productName, // Use printName if available, otherwise productName
//         qty: new Decimal(inventory.quantity || 0).toNumber(), // Quantity as a number
//         mrp: new Decimal(inventory.product.MRP || 0).toNumber(), // MRP as a number
//         cost: new Decimal(inventory.product.cost || 0).toNumber(), // Cost as a number
//         centerName: inventory.center.centerName, // Center name
//     }));

//     // Calculate the total quantity across inventories
//     let totalQuantity: Decimal = new Decimal(0);
//     formattedInventory.forEach((inventory) => {
//         totalQuantity = totalQuantity.plus(new Decimal(inventory.qty));
//     });

//     return {
//         inventories: formattedInventory,
//         totalQuantity: totalQuantity.toNumber(),
//     };
// };

// export const filterInventory = async (productId?: string, centerId?: string, date?: string) => {
//     const filterConditions: any = {
//         status: true,
//     };

//     // Filtering conditions based on productId and centerId
//     if (productId) {
//         filterConditions.productId = productId;
//     }

//     if (centerId) {
//         filterConditions.centerId = centerId;
//     }

//     console.log("Filter Conditions:", filterConditions);

//     // Fetch inventory list filtered by productId and/or centerId
//     const inventories = await db.inventory.findMany({
//         where: filterConditions,
//         include: {
//             product: true,
//             center: true,
//         },
//     });

//     console.log("Inventories fetched:", inventories);

//     // Calculate total quantity for the specified date
//     const currentDate = new Date();
//     const filterDate = date ? new Date(date) : currentDate;

//     const dateStart = new Date(filterDate.setHours(0, 0, 0, 0));
//     const dateEnd = new Date(filterDate.setHours(23, 59, 59, 999));

//     const inventoriesOnDate = await db.inventory.findMany({
//         where: {
//             status: true,
//             updatedAt: {
//                 gte: dateStart,
//                 lt: dateEnd,
//             },
//         },
//     });

//     console.log("Inventories on date:", inventoriesOnDate);

//     let totalQuantity: Decimal = new Decimal(0);
//     inventoriesOnDate.forEach((inventory) => {
//         if (inventory.quantity) {
//             totalQuantity = totalQuantity.plus(new Decimal(inventory.quantity));
//         }
//     });

//     return {
//         inventories,
//         totalQuantity,
//     };
// };

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

// interface StockRecord {
//     productName: string;
//     centerName: string;
//     qty: Decimal;
//     avgCost: number;
//     avgMRP: number;
// }

// // Adjust the getStock function to refine filtering logic
// export const getStock = async (productId?: string, centerId?: string, date?: string) => {
//     const filterConditions: any = {};

//     if (productId) {
//         filterConditions.productId = productId;
//     }

//     if (centerId) {
//         filterConditions.centerId = centerId;
//     }

//     // Default to current date if no date is provided
//     const currentDate = new Date();
//     const filterDate = date ? new Date(date) : currentDate;

//     // Set the filter to include all vouchers up to the end of the specified date
//     const dateEnd = new Date(filterDate.setHours(23, 59, 59, 999));

//     // Fetch voucherProduct list with necessary relations
//     const voucherProducts = await db.voucherProduct.findMany({
//         where: {
//             voucher: {
//                 date: {
//                     lte: dateEnd, // Consider vouchers up to the specified date
//                 },
//                 voucherGroup: {
//                     voucherName: {
//                         in: ['GRN', 'INVOICE', 'SALES-RETURN', 'PURCHASE-RETURN', 'STOCK-TRANSFER'],
//                     },
//                 },
//             },
//             ...filterConditions, // Include productId and centerId conditions if provided
//         },
//         include: {
//             product: true, // Include product details
//             voucher: {
//                 include: {
//                     voucherGroup: true, // Include voucher group to filter by shortname
//                     VoucherCenter: true, // Include VoucherCenter details for stock transfers
//                 },
//             },
//             center: true, // Include center details
//         },
//     });

//     // Define stockData as a Record object
//     const stockData: Record<string, StockRecord> = {};

//     // Iterate through each voucherProduct and calculate the totals
//     for (const vp of voucherProducts) {
//         const productName = vp.product.printName || vp.product.productName;
//         const centerName = vp.center?.centerName || 'Unknown Center';
//         const key = `${productName}-${centerName}`;

//         // Initialize stock data for this product-center pair if not already initialized
//         if (!stockData[key]) {
//             stockData[key] = {
//                 productName,
//                 centerName,
//                 qty: new Decimal(0),
//                 avgCost: 0,
//                 avgMRP: 0,
//             };
//         }

//         const stockRecord = stockData[key];

//         // Handle quantity based on voucherGroup and centerStatus (for stock transfers)
//         if (['GRN', 'SALES-RETURN'].includes(vp.voucher.voucherGroup.voucherName)) {
//             stockRecord.qty = stockRecord.qty.plus(new Decimal(vp.quantity));
//         } else if (['INVOICE', 'PURCHASE-RETURN'].includes(vp.voucher.voucherGroup.voucherName)) {
//             stockRecord.qty = stockRecord.qty.minus(new Decimal(vp.quantity));
//         } else if (vp.voucher.voucherGroup.voucherName === 'STOCK-TRANSFER') {
//             // Handle stock transfers based on center status
//             for (const vc of vp.voucher.VoucherCenter) {
//                 if (vc.centerId === vp.centerId) {
//                     if (vc.centerStatus === 'IN') {
//                         stockRecord.qty = stockRecord.qty.plus(new Decimal(vp.quantity));
//                     } else if (vc.centerStatus === 'OUT') {
//                         stockRecord.qty = stockRecord.qty.minus(new Decimal(vp.quantity));
//                     }
//                 }
//             }
//         }

//         // Add cost and MRP values for average calculation
//         stockRecord.avgCost = stockRecord.qty.gt(0) ? stockRecord.avgCost + new Decimal(vp.cost).times(vp.quantity).toNumber() : stockRecord.avgCost;
//         stockRecord.avgMRP = stockRecord.qty.gt(0) ? stockRecord.avgMRP + new Decimal(vp.MRP).times(vp.quantity).toNumber() : stockRecord.avgMRP;
//     }

//     // Prepare final result array with all products, including those with 0 quantity
//     const result: StockRecord[] = [];

//     Object.values(stockData).forEach(record => {
//         // Calculate average cost and MRP only if qty > 0
//         const avgCost = record.qty.gt(0) ? new Decimal(record.avgCost).div(record.qty).toNumber() : 0;
//         const avgMRP = record.qty.gt(0) ? new Decimal(record.avgMRP).div(record.qty).toNumber() : 0;

//         // Add the record to result array
//         result.push({
//             productName: record.productName,
//             centerName: record.centerName,
//             qty: record.qty,
//             avgCost,
//             avgMRP,
//         });
//     });

//     return result;
// };









