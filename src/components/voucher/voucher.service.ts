import { Role, InventoryMode } from "@prisma/client";
import { db } from "../../utils/db.server";

export const list = async () => {
    return db.voucher.findMany();
}

export const get = async (id: any) => {
    return db.voucher.findFirst({
        where: {
            id,
            isconform: true
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
            id: id,
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

export const getPendingVoucherCondition = async () => {
    return db.voucher.findMany({
        where: {
            OR: [
                {
                    voucherNumber: {
                        startsWith: 'INV',
                    },
                },
                {
                    voucherNumber: {
                        startsWith: 'SALES-R',
                    },
                },
            ],
            isconform: false, // Ensure the voucher is not confirmed
        },
        include: {
            voucherProduct: true,
            user: { select: { name: true } },
            journalLine: true,
            party: true, // Include related party details
        },
    });
};

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
        data: { voucherNumber: data.voucherNumber, date: data.date, totalDebit: data?.totalDebit, totalCredit: data?.totalCredit, amount: data.amount, paidValue: data.paidValue, location: data.location, partyId: data?.partyId, chartofAccountId: data?.chartofAccountId, note: data.note, dueDays: data?.dueDays, isconform: data?.isconform, refVoucherNumber: data?.refVoucherNumber, isRef: data?.isRef, refNumber: data?.refNumber, voucherGroupId: data.voucherGroupId, authUser: data?.authUser, createdBy: data.createdBy },
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

export const updatePendingVoucher = async (data: any, id: any) => {
    return db.voucher.update({
        where: id,
        data: { amount: data.amount, isconform: true }
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

export const getVouchersByPartyOutstanding = async (voucherGroupId: string, partyId?: any, userId?: any,) => {
    return db.voucher.findMany({
        where: {
            voucherGroupId: voucherGroupId,
            ...(userId ? { authUser: userId } : {}), // Filter by authUser if userId is passed
            ...(partyId ? { partyId: partyId } : {}), // Filter by partyId if partyId is passed
            NOT: {
                paidValue: {
                    gte: db.voucher.fields.amount
                }
            },
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
        },
        orderBy: {
            partyId: 'asc'
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
            },
            isconform: true
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

export const getVouchersByPartyByUserAndDateRangeall = async (voucherGroupId: string, startDate?: Date, endDate?: Date, userId?: any) => {
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

export const getVouchersGroupedByAuthUserWithVisits = async (month?: number, year?: number) => {
    const currentDate = new Date();
    const selectedMonth = month !== undefined ? month - 1 : currentDate.getMonth();
    const selectedYear = year !== undefined ? year : currentDate.getFullYear();

    const startDate = new Date(selectedYear, selectedMonth, 1);
    const endDate = new Date(selectedYear, selectedMonth + 1, 0);

    const todayStart = new Date(currentDate.setHours(0, 0, 0, 0));  // Start of the current day
    const todayEnd = new Date(currentDate.setHours(23, 59, 59, 999));  // End of the current day

    // Fetch the voucherGroup IDs for SALES-RETURN and INVOICE
    const salesReturnGroup = await db.voucherGroup.findFirst({
        where: { voucherName: 'SALES-RETURN' },
        select: { id: true }
    });

    const invoiceGroup = await db.voucherGroup.findFirst({
        where: { voucherName: 'INVOICE' },
        select: { id: true }
    });

    if (!salesReturnGroup || !invoiceGroup) {
        throw new Error("Unable to find specified voucher groups");
    }

    // Group by authUser for monthly Sales-Return and Invoice
    const salesReturnVouchersMonthly = await db.voucher.groupBy({
        by: ['authUser'],
        where: {
            date: {
                gte: startDate,
                lte: endDate,
            },
            voucherGroupId: salesReturnGroup.id,
        },
        _sum: {
            amount: true,
        },
        _count: {
            id: true,
        },
    });

    const invoiceVouchersMonthly = await db.voucher.groupBy({
        by: ['authUser'],
        where: {
            date: {
                gte: startDate,
                lte: endDate,
            },
            voucherGroupId: invoiceGroup.id,
        },
        _sum: {
            amount: true,
        },
        _count: {
            id: true,
        },
    });

    // Group by authUser for daily Sales-Return and Invoice
    const salesReturnVouchersDaily = await db.voucher.groupBy({
        by: ['authUser'],
        where: {
            date: {
                gte: todayStart,
                lte: todayEnd,
            },
            voucherGroupId: salesReturnGroup.id,
        },
        _sum: {
            amount: true,
        },
        _count: {
            id: true,
        },
    });

    const invoiceVouchersDaily = await db.voucher.groupBy({
        by: ['authUser'],
        where: {
            date: {
                gte: todayStart,
                lte: todayEnd,
            },
            voucherGroupId: invoiceGroup.id,
        },
        _sum: {
            amount: true,
        },
        _count: {
            id: true,
        },
    });

    // Create a map to combine the data for all users
    const userVoucherMap: { [authUser: string]: any } = {};

    // Process monthly sales return vouchers
    salesReturnVouchersMonthly.forEach((voucher) => {
        if (voucher.authUser !== null) {
            if (!userVoucherMap[voucher.authUser]) {
                userVoucherMap[voucher.authUser] = {
                    totalSalesReturn: voucher._sum.amount || 0,
                    totalSalesReturnCount: voucher._count.id || 0,
                    totalInvoiceValue: 0,
                    totalInvoices: 0,
                    totalVisits: 0,
                    daily: {
                        totalSalesReturn: 0,
                        totalSalesReturnCount: 0,
                        totalInvoiceValue: 0,
                        totalInvoices: 0,
                        totalVisits: 0,
                    }
                };
            } else {
                userVoucherMap[voucher.authUser].totalSalesReturn += voucher._sum.amount || 0;
                userVoucherMap[voucher.authUser].totalSalesReturnCount += voucher._count.id || 0;
            }
        }
    });

    // Process monthly invoice vouchers
    invoiceVouchersMonthly.forEach((voucher) => {
        if (voucher.authUser !== null) {
            if (!userVoucherMap[voucher.authUser]) {
                userVoucherMap[voucher.authUser] = {
                    totalSalesReturn: 0,
                    totalSalesReturnCount: 0,
                    totalInvoiceValue: voucher._sum.amount || 0,
                    totalInvoices: voucher._count.id || 0,
                    totalVisits: 0,
                    daily: {
                        totalSalesReturn: 0,
                        totalSalesReturnCount: 0,
                        totalInvoiceValue: 0,
                        totalInvoices: 0,
                        totalVisits: 0,
                    }
                };
            } else {
                userVoucherMap[voucher.authUser].totalInvoiceValue += voucher._sum.amount || 0;
                userVoucherMap[voucher.authUser].totalInvoices += voucher._count.id || 0;
            }
        }
    });

    // Process daily sales return vouchers
    salesReturnVouchersDaily.forEach((voucher) => {
        if (voucher.authUser !== null) {
            if (userVoucherMap[voucher.authUser]) {
                userVoucherMap[voucher.authUser].daily.totalSalesReturn += voucher._sum.amount || 0;
                userVoucherMap[voucher.authUser].daily.totalSalesReturnCount += voucher._count.id || 0;
            }
        }
    });

    // Process daily invoice vouchers
    invoiceVouchersDaily.forEach((voucher) => {
        if (voucher.authUser !== null) {
            if (userVoucherMap[voucher.authUser]) {
                userVoucherMap[voucher.authUser].daily.totalInvoiceValue += voucher._sum.amount || 0;
                userVoucherMap[voucher.authUser].daily.totalInvoices += voucher._count.id || 0;
            }
        }
    });

    // Fetch visiting customer data for each authUser
    const visitCountsMonthly = await db.vistingCustomer.groupBy({
        by: ['createdBy'],
        where: {
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
        },
        _count: {
            id: true, // Count total visits for the month
        },
    });

    const visitCountsDaily = await db.vistingCustomer.groupBy({
        by: ['createdBy'],
        where: {
            createdAt: {
                gte: todayStart,
                lte: todayEnd,
            },
        },
        _count: {
            id: true, // Count total visits for today
        },
    });

    // Map monthly visit counts to userVoucherMap
    visitCountsMonthly.forEach((visit) => {
        if (visit.createdBy && userVoucherMap[visit.createdBy]) {
            userVoucherMap[visit.createdBy].totalVisits += visit._count.id || 0;
        } else if (visit.createdBy) {
            userVoucherMap[visit.createdBy] = {
                totalVisits: visit._count.id || 0,
                daily: {
                    totalSalesReturn: 0,
                    totalSalesReturnCount: 0,
                    totalInvoiceValue: 0,
                    totalInvoices: 0,
                    totalVisits: 0,
                },
                totalSalesReturn: 0,
                totalSalesReturnCount: 0,
                totalInvoiceValue: 0,
                totalInvoices: 0,
            };
        }
    });

    // Map daily visit counts to userVoucherMap
    visitCountsDaily.forEach((visit) => {
        if (visit.createdBy && userVoucherMap[visit.createdBy]) {
            userVoucherMap[visit.createdBy].daily.totalVisits += visit._count.id || 0;
        }
    });

    // Convert the map into an array and fetch user names along with target, filtering for SALESMEN
    const userData = await Promise.all(Object.keys(userVoucherMap).map(async (authUser) => {
        if (authUser) {
            const user = await db.user.findFirst({
                where: {
                    id: authUser,
                    role: Role.SALESMEN,  // Filter by role SALESMAN
                },
                select: { name: true, target: true },
            });

            if (user) {
                return {
                    username: user?.name || "Unknown User",
                    target: user?.target || 0,
                    totalVisits: userVoucherMap[authUser].totalVisits || 0,
                    totalInvoices: userVoucherMap[authUser].totalInvoices,
                    totalInvoiceValue: userVoucherMap[authUser].totalInvoiceValue,
                    totalSalesReturn: userVoucherMap[authUser].totalSalesReturn,
                    totalSalesReturnCount: userVoucherMap[authUser].totalSalesReturnCount,
                    daily: {
                        totalInvoices: userVoucherMap[authUser].daily.totalInvoices,
                        totalInvoiceValue: userVoucherMap[authUser].daily.totalInvoiceValue,
                        totalSalesReturn: userVoucherMap[authUser].daily.totalSalesReturn,
                        totalSalesReturnCount: userVoucherMap[authUser].daily.totalSalesReturnCount,
                        totalVisits: userVoucherMap[authUser].daily.totalVisits,
                    }
                };
            }
        }
        return null;
    }));

    // Filter out null values in case any authUser is missing or doesn't have the SALESMAN role
    return userData.filter(data => data !== null);
};





