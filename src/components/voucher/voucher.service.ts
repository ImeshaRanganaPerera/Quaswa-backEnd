import { db } from "../../utils/db.server";

export const list = async () => {
    return db.voucher.findMany();
}

export const get = async (id: any) => {
    return db.voucher.findFirst({
        where: {
            id,
        },
        include: {
            party: true,
            user: {
                select: {
                    name: true,
                    phoneNumber: true,
                }
            },
            voucherProduct: {
                include: {
                    product: {
                        select: {
                            productName: true,
                            printName: true
                        }
                    },
                }
            },
            referVouchers: true,
            PaymentVoucher: true
        }
    });
}

export const getbyid = async (id: any) => {
    return db.voucher.findFirst({
        where: {
            id: id
        },
        include: {
            user: {
                select: {
                    name: true,
                    phoneNumber: true,
                }
            },
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
                    gte: db.voucher.fields.amount
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
                    gt: db.voucher.fields.amount
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
        data: { voucherNumber: data.voucherNumber, date: data.date, totalDebit: data?.totalDebit, totalCredit: data?.totalCredit, amount: data.amount, paidValue: data.paidValue, location: data.location, partyId: data?.partyId, chartofAccountId: data?.chartofAccountId, note: data.note, dueDays: data?.dueDays, isconform: data?.isconform, refVoucherNumber: data?.refVoucherNumber, isRef: data?.isRef, voucherGroupId: data.voucherGroupId, authUser: data?.authUser, createdBy: data.createdBy },
        include: {
            party: true,
            voucherProduct: {
                select: {
                    MRP: true,
                    amount: true,
                    centerId: true,
                    cost: true,
                    createdAt: true,
                    id: true,
                    isdisabale: true,
                    minPrice: true,
                    discount: true,
                    productId: true,
                    quantity: true,
                    remainingQty: true,
                    sellingPrice: true,
                    updatedAt: true,
                    voucherId: true,
                    product: {
                        select: {
                            productName: true,
                            printName: true
                        }
                    }
                }
            },
            referVouchers: true,
            PaymentVoucher: true,
            user: {
                select: {
                    name: true,
                    phoneNumber: true,
                }
            },
            VoucherCenter: true,
            voucherGroup: true,
        }
    });
}

export const update = async (data: any, id: any) => {
    return db.voucher.update({
        where: id,
        data: data
    });
}

export const updateVoucherNumber = async (data: any) => {
    const voucher = await db.voucher.findFirst({
        where: {
            voucherNumber: data.refVoucherNumber,
        },
    });

    if (!voucher) {
        throw new Error("Voucher not found");
    }
    return db.voucher.update({
        where: {
            id: voucher.id,
        },
        data: {
            isRef: data.isRef,
            refVoucherNumber: data.voucherId,
        },
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

export const getVouchersByPartyByUserAndDateRange = async (voucherGroupId: string, startDate?: Date, endDate?: Date, userId?: any) => {
    return db.voucher.findMany({
        where: {
            ...(userId && { user: userId }),
            voucherGroupId: voucherGroupId,
            date: {
                gte: startDate,
                lte: endDate,
            }
        },
        include: {
            party: true,
            chartofacc: {
                select: {
                    accountName: true,
                }
            },

            voucherProduct: {
                select: {
                    MRP: true,
                    amount: true,
                    centerId: true,
                    cost: true,
                    createdAt: true,
                    id: true,
                    isdisabale: true,
                    minPrice: true,
                    discount: true,
                    productId: true,
                    quantity: true,
                    remainingQty: true,
                    sellingPrice: true,
                    updatedAt: true,
                    voucherId: true,
                    product: {
                        select: {
                            productName: true,
                            printName: true
                        }
                    }
                }
            },
            referVouchers: true,
            PaymentVoucher: true,
            user: {
                select: {
                    name: true,
                    phoneNumber: true,
                }
            },
            VoucherCenter: {
                select: {
                    center: true,
                    centerStatus: true,
                }
            }
        }
    });
};

export const getVouchersByUserAndDateRange = async (userId: string, startDate?: Date, endDate?: Date) => {
    return db.voucher.findMany({
        where: {
            createdBy: userId,
            date: {
                gte: startDate,
                lte: endDate,
            }
        },
        include: {
            chartofacc: {
                select: {
                    accountName: true,
                }
            },

            party: true,
            voucherProduct: {
                select: {
                    MRP: true,
                    amount: true,
                    centerId: true,
                    cost: true,
                    createdAt: true,
                    id: true,
                    isdisabale: true,
                    minPrice: true,
                    discount: true,
                    productId: true,
                    quantity: true,
                    remainingQty: true,
                    sellingPrice: true,
                    updatedAt: true,
                    voucherId: true,
                    product: {
                        select: {
                            productName: true,
                            printName: true
                        }
                    }
                }
            },
            referVouchers: true,
            PaymentVoucher: true,
            user: {
                select: {
                    name: true,
                    phoneNumber: true,
                }
            },
            VoucherCenter: {
                select: {
                    center: true,
                    centerStatus: true,
                }
            }
        }
    });
};

export const getRefVoucherbyVoucherGrpid = async (data: any) => {
    return db.voucher.findMany({
        where: {
            voucherGroupId: data.voucherGroupId,
            partyId: data.partyId,
            isRef: false
        },
        include: {
            voucherProduct: {
                select: {
                    MRP: true,
                    amount: true,
                    centerId: true,
                    cost: true,
                    createdAt: true,
                    id: true,
                    isdisabale: true,
                    minPrice: true,
                    discount: true,
                    productId: true,
                    quantity: true,
                    remainingQty: true,
                    sellingPrice: true,
                    updatedAt: true,
                    voucherId: true,
                    product: {
                        select: {
                            productName: true,
                            printName: true
                        }
                    }
                }
            }
        }
    });
}