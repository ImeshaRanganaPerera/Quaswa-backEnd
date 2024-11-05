import { db } from "../../utils/db.server";

export const list = async () => {
    return db.voucherProduct.findMany();
}

export const getbyVoucherId = async (id: any) => {
    return db.voucherProduct.findMany({
        where: {
            voucherId: id,
        },
        include: {
            product: true
        }
    });
}

export const getbyProductIdCenterId = async (data: any) => {
    return db.voucherProduct.findMany({
        where: {
            centerId: data.centerId,
            productId: data.productId,
            remainingQty: {
                gt: 0,
            }
        },
        include: {
            product: true
        },
    });
}

export const create = async (data: any) => {
    return db.voucherProduct.create({
        data: data
    });
}

export const updateVoucherProduct = async (data: any, id: any) => {
    return db.voucherProduct.update({
        where: {
            id: id // Correctly pass the id as a string, not an object
        },
        data: {
            discount: data.discount,
            stockStatus: data?.stockStatus,
        }
    });
};

export const update = async (data: any, id: any) => {
    return db.voucherProduct.update({
        where: id,
        data: data
    });
}

export const costofsales = async (startDate: any, endDate: any) => {
    const vouchers = await db.voucher.findMany({
        where: {
            voucherNumber: { startsWith: 'INV' },
            date: {
                gte: startDate,
                lte: endDate,
            },
            isconform: true,
            isPayment: true,
        },
        include: {
            voucherProduct: {
                select: {
                    product: {
                        select: {
                            itemCode: true,
                            printName: true,
                        }
                    },
                    cost: true,
                    MRP: true,
                    discount: true,
                    quantity: true,
                },
            },
        },
        orderBy: { voucherNumber: 'asc' }
    });

    // Define a type for products in the accumulator
    type ProductTotal = {
        itemCode: string;
        printName: string;
        totalqty: number;
        totalCost: number;
        discountprice: number;
        totalMRP: number;
        voucherNumbers: string[]; // Track unique voucher numbers
        voucherCount: number;     // Count of unique vouchers
    };

    // Flatten the data and calculate totals with unique voucher counts
    const productTotals = vouchers.flatMap(voucher => voucher.voucherProduct.map(vp => ({
        ...vp,
        voucherNumber: voucher.voucherNumber,
    })))
        .reduce((acc: ProductTotal[], vp: any) => {
            const itemCode = vp.product.itemCode;
            const printName = vp.product.printName;
            const qty = Number(vp.quantity);

            // Calculate the cost and MRP per quantity
            const cost = (Number(vp.cost) || 0) * (Number(vp.quantity) || 0);
            const mrp = (Number(vp.MRP) || 0) * (Number(vp.quantity) || 0);
            const discountprice = vp.discount.includes('%') ? (Number(vp.MRP) - (Number(vp.MRP) * (parseFloat(vp.discount.replace('%', '')) / 100))) * Number(vp.quantity) : (Number(vp.MRP) - Number(vp.discount)) * Number(vp.quantity);
            console.log(vp.voucherNumber, printName, discountprice)

            // Find existing product entry or initialize a new one
            let existingProduct = acc.find((prod) => prod.itemCode === itemCode);

            if (existingProduct) {
                // Accumulate totals for existing product
                existingProduct.totalCost += cost;
                existingProduct.totalMRP += mrp;
                existingProduct.totalqty += Number(qty);
                existingProduct.discountprice += discountprice;

                // Track unique vouchers for each product
                if (!existingProduct.voucherNumbers.includes(vp.voucherNumber)) {
                    existingProduct.voucherNumbers.push(vp.voucherNumber);
                    existingProduct.voucherCount++;
                }
            } else {
                // Add a new product entry with initial totals and count
                acc.push({
                    itemCode,
                    printName,
                    totalCost: cost,
                    totalMRP: mrp,
                    totalqty: qty,
                    discountprice: discountprice,
                    voucherNumbers: [vp.voucherNumber], // Track unique voucher numbers
                    voucherCount: 1, // Initialize voucher count
                });
            }

            return acc;
        }, []);

    // Remove voucherNumbers array before returning if not needed
    return productTotals.map(({ voucherNumbers, ...rest }) => rest);
};
