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
            voucherProduct: true,
            referVouchers: true
        }
    });
}

export const getbyid = async (id: any) => {
    return db.voucher.findFirst({
        where: {
            id: id
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

export const getVoucherbyParty = async (id: any) => {
    return db.voucher.findMany({
        where: {
            partyId: id,
        }
    });
}

export const getVoucherbyPartytrue = async (id: any, condition: any) => {
    return db.voucher.findMany({
        where: {
            partyId: id,
            isconform: condition,
            NOT: {
                paidValue: {
                    equals: db.voucher.fields.amount
                }
            },
            OR: [
                { voucherNumber: { startsWith: 'GRN' } },
                { voucherNumber: { startsWith: 'INV' } },
            ],
        }
    });
}

export const getVoucherbyChartofacc = async (id: any, condition: any) => {
    return db.voucher.findMany({
        where: {
            chartofAccountId: id,
            isconform: condition,
            NOT: {
                paidValue: {
                    equals: db.voucher.fields.amount
                }
            },
            OR: [
                { voucherNumber: { startsWith: 'UTILITY-BC' } },
            ],
        }
    });
}

export const getVoucherbyPartyfalse = async (id: any) => {
    return db.voucher.findMany({
        where: {
            partyId: id,
            isconform: false
        }
    });
}

export const create = async (data?: any) => {
    return db.voucher.create({
        data: { voucherNumber: data.voucherNumber, date: data.date, amount: data.amount, paidValue: data.paidValue, location: data.location, partyId: data?.partyId, chartofAccountId: data?.chartofAccountId, note: data.note, isconform: data?.isconform, voucherGroupId: data.voucherGroupId, createdBy: data.createdBy }
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

    const shortname = voucherGroup.shortname; // e.g., 'BILLING', 'RECEIPT'

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
        newVoucherNumber = `${shortname}-${String(lastNumber + 1).padStart(4, '0')}`;
    } else {
        // If no voucher exists for this group, start with '0001'
        newVoucherNumber = `${shortname}-0001`;
    }

    return newVoucherNumber;
};

export const updateConform = async (data: any, id: any) => {
    return db.voucher.update({
        where: id,
        data: { isconform: data.isconform }
    });
}

export const findManyByIds = async (voucherIds: any[]) => {
    return db.voucher.findMany({
        where: {
            id: { in: voucherIds }
        },
        orderBy: { createdAt: 'asc' } // Order by the oldest first (if needed)
    });
};

export const updatepaidValue = async (data: any) => {
    return db.voucher.update({
        where: {
            id: data.id,
        },
        data: {
            paidValue: data.paidValue,
        }
    });
};