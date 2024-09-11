import { db } from "../../utils/db.server";

export const list = async () => {
    return db.voucher.findMany();
}

export const get = async (id: any) => {
    return db.voucher.findFirst({
        where: {
            id,
        }, include: {
            party: true,
            voucherProduct: true
        }
    });
}

export const getVoucherbyGrp = async (id: any) => {
    return db.voucher.findMany({
        where: {
            voucherGroupId: id,
        },
        include: {
            party: true,
        }
    });
}

export const create = async (data?: any) => {
    return db.voucher.create({
        data: { voucherNumber: data.voucherNumber, date: data.date, amount: data.amount, paidValue: data.paidValue, location: data.location, partyId: data.partyId, voucherGroupId: data.voucherGroupId, createdBy: data.createdBy }
    });
}

export const update = async (data: any, id: any) => {
    return db.voucher.update({
        where: id,
        data: data
    });
}

export const generateVoucherNumber = async (voucherGroupId: any) => {
    // Get the voucher group by ID to retrieve its name
    const voucherGroup = await db.voucherGroup.findUnique({
        where: { id: voucherGroupId },
    });

    if (!voucherGroup) {
        throw new Error("Voucher Group not found");
    }

    const groupName = voucherGroup.voucherName; // e.g., 'BILLING', 'RECEIPT'

    // Get the latest voucher for the specified group
    const lastVoucher = await db.voucher.findFirst({
        where: { voucherGroupId },
        orderBy: { createdAt: 'desc' }, // Get the latest voucher
    });

    let newVoucherNumber;

    if (lastVoucher) {
        // Extract the numeric part from the last voucher number
        const lastVoucherNumber = lastVoucher.voucherNumber.split('-').pop();
        const lastNumber = parseInt(lastVoucherNumber || '0', 10);
        // Increment the number for the new voucher
        newVoucherNumber = `${groupName}-${String(lastNumber + 1).padStart(4, '0')}`;
    } else {
        // If no voucher exists for this group, start with '0001'
        newVoucherNumber = `${groupName}-0001`;
    }

    return newVoucherNumber;
};