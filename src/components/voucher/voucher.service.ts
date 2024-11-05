import { Role, InventoryMode } from "@prisma/client";
import { db } from "../../utils/db.server";
import { Decimal } from "@prisma/client/runtime/library";

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
            chartofacc: {
                select: {
                    accountName: true,
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
            PaymentVoucher: true,
            VoucherCenter: {
                select: {
                    center: {
                        select: {
                            centerName: true
                        }
                    },
                    centerStatus: true
                },
            },
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
            chartofacc: {
                select: {
                    accountName: true,
                }
            },
            VoucherCenter: true
        }
    });
}

export const getApprovedVoucher = async (userid: any) => {
    return db.voucher.findMany({
        where: {
            authUser: userid,
            voucherNumber: {
                startsWith: 'INV',
            },
            appovedBy: { not: null },
            status: 'PAYMENT PENDING',
            isconform: false,
            isPayment: false,
        },
        include: {
            voucherProduct: true,
            user: { select: { name: true } },
            journalLine: true,
            party: true,
        },
        orderBy: {
            date: 'desc'
        }
    });
};

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
                        startsWith: 'SRET',
                    },
                },
            ],
            AND: [
                {
                    OR: [
                        { status: null },
                        { status: "PENDING" }
                    ],
                },
                { isconform: false }
            ],
        },
        include: {
            voucherProduct: true,
            user: { select: { name: true } },
            journalLine: true,
            party: true,
            voucherGroup: {
                select: {
                    voucherName: true
                }
            }
        },
        orderBy: {
            date: 'desc'
        }
    });
};

interface SalesmanReport {
    salesmanName: string;
    Invoices: {
        date: any;
        voucherNumber: string;
        amount: number;
        partyName: string;
        voucherName: string;
    }[];
    totalValue: number;
}

export const getSalesmanWiseVouchers = async (startDate: any, endDate: any, userId?: any) => {
    const vouchers = await db.voucher.findMany({
        where: {
            ...(userId ? { authUser: userId } : {}),
            date: {
                gte: startDate,
                lte: endDate,
            },
            OR: [
                { voucherNumber: { startsWith: 'INV' } },
                { voucherNumber: { startsWith: 'SRET' } },
            ],
            isconform: true,
        },
        include: {
            user: { select: { name: true } },
            party: { select: { name: true } },
            voucherGroup: { select: { voucherName: true } },
        },
        orderBy: {
            date: 'desc'
        }
    });

    console.log("Vouchers retrieved:", vouchers);

    const report = vouchers.reduce<Record<string, SalesmanReport>>((acc, voucher) => {
        const authUser = voucher.authUser || 'Unknown Salesman';
        const amount = voucher.amount ? (voucher.amount as Decimal).toNumber() : 0;
        const adjustedAmount = voucher.voucherNumber.startsWith('SRET') ? -amount : amount;

        if (!acc[authUser]) {
            acc[authUser] = {
                salesmanName: voucher.user?.name || 'Unknown',
                Invoices: [],
                totalValue: 0,
            };
        }

        console.log(`Processing voucher: ${voucher.voucherNumber}, adjustedAmount: ${adjustedAmount}`);

        acc[authUser].Invoices.push({
            date: voucher.date,
            voucherNumber: voucher.voucherNumber,
            amount: adjustedAmount,
            partyName: voucher.party?.name || 'N/A',
            voucherName: voucher.voucherGroup?.voucherName || 'N/A',
        });
        acc[authUser].totalValue += adjustedAmount;

        return acc;
    }, {});

    console.log("Report generated:", report);

    return Object.values(report);
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
    const vouchers = await db.voucher.findMany({
        where: {
            partyId: id,
            isconform: condition,
            OR: [
                { voucherNumber: { startsWith: 'GRN' } },
                { voucherNumber: { startsWith: 'INV' } },
            ],
        }
    });
    const filteredVouchers = vouchers.filter(voucher => {
        const paidValue = new Decimal(voucher.paidValue ?? 0); // Handle possible 'null' and convert to Decimal
        const returnValue = new Decimal(voucher.returnValue ?? 0); // Handle possible 'null' and convert to Decimal
        const value = new Decimal(voucher.value || 0); // Ensure value is treated as Decimal
        const amount = new Decimal(voucher.amount || 0); // Ensure amount is treated as Decimal
        const totalPaid = paidValue.plus(returnValue); // Add using Decimal.js

        return voucher.voucherNumber.startsWith('GRN') ? (voucher.isconform === false ? totalPaid.lessThan(amount) : totalPaid.lessThan(value)) : totalPaid.lessThan(amount); // Filter those with outstanding amounts
    });

    return filteredVouchers;
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
        data: { voucherNumber: data.voucherNumber, date: data.date, totalDebit: data?.totalDebit, totalCredit: data?.totalCredit, value: data?.value, amount: data.amount, paidValue: data.paidValue, returnValue: data?.returnValue, location: data.location, partyId: data?.partyId, chartofAccountId: data?.chartofAccountId, note: data.note, dueDays: data?.dueDays, isconform: data?.isconform, refVoucherNumber: data?.refVoucherNumber, stockStatus: data?.stockStatus, isRef: data?.isRef, refNumber: data?.refNumber, status: data?.status, isPayment: data?.isPayment, voucherGroupId: data.voucherGroupId, authUser: data?.authUser, appovedBy: data?.appovedBy, createdBy: data.createdBy },
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
        data: { amount: data.amount, appovedBy: data.appovedBy, isconform: data.isconform, isPayment: data.isPayment, stockStatus: data?.stockStatus, status: data?.status, note: data?.note }
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
            returnValue: data?.returnValue,
            refVoucherNumber: data.voucherId,
            status: data?.status
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
        data: { isconform: data.isconform, value: data.value }
    });
}

export const voucherCancel = async (data: any, id: any) => {
    return db.voucher.update({
        where: id,
        data: { status: data.status }
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

// export const getVouchersByPartyOutstanding = async (voucherGroupId: string, partyId?: any, userId?: any,) => {
//     return db.voucher.findMany({
//         where: {
//             voucherGroupId: voucherGroupId,
//             ...(userId ? { authUser: userId } : {}), // Filter by authUser if userId is passed
//             ...(partyId ? { partyId: partyId } : {}), // Filter by partyId if partyId is passed
//             NOT: {
//                 paidValue: {
//                     gte: db.voucher.fields.amount
//                 }
//             },
//         },
//         include: {
//             party: true,
//             chartofacc: {
//                 select: {
//                     accountName: true,
//                 }
//             },
//             voucherProduct: {
//                 select: {
//                     MRP: true,
//                     amount: true,
//                     centerId: true,
//                     cost: true,
//                     createdAt: true,
//                     id: true,
//                     isdisabale: true,
//                     minPrice: true,
//                     discount: true,
//                     productId: true,
//                     quantity: true,
//                     remainingQty: true,
//                     sellingPrice: true,
//                     updatedAt: true,
//                     voucherId: true,
//                     product: {
//                         select: {
//                             productName: true,
//                             printName: true
//                         }
//                     }
//                 }
//             },
//             referVouchers: true,
//             PaymentVoucher: true,
//             user: {
//                 select: {
//                     name: true,
//                     phoneNumber: true,
//                 }
//             },
//             VoucherCenter: {
//                 select: {
//                     center: true,
//                     centerStatus: true,
//                 }
//             }
//         },
//         orderBy: {
//             partyId: 'asc'
//         }
//     });
// };

export const getVouchersByPartyOutstanding = async (voucherGroupId: string, partyId?: any, userId?: any) => {
    // Fetch vouchers without applying the complex condition (paidValue + returnValue)
    const vouchers = await db.voucher.findMany({
        where: {
            voucherGroupId: voucherGroupId,
            ...(userId ? { authUser: userId } : {}), // Filter by authUser if userId is passed
            ...(partyId ? { partyId: partyId } : {}), // Filter by partyId if partyId is passed
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
            date: 'desc'
        }
    });

    // Filter vouchers in the application logic where paidValue + returnValue >= amount
    const filteredVouchers = vouchers.filter(voucher => {
        const paidValue = new Decimal(voucher.paidValue ?? 0); // Handle possible 'null' and convert to Decimal
        const returnValue = new Decimal(voucher.returnValue ?? 0); // Handle possible 'null' and convert to Decimal
        const totalPaid = paidValue.plus(returnValue); // Add using Decimal.js
        const amount = new Decimal(voucher.amount || 0); // Ensure amount is treated as Decimal

        return totalPaid.lessThan(amount); // Filter those with outstanding amounts
    });

    return filteredVouchers;
};


export const getVouchersByPartySettlement = async (voucherGroupId: string, partyId?: any, userId?: any,) => {
    return db.voucher.findMany({
        where: {
            voucherGroupId: voucherGroupId,
            ...(userId ? { authUser: userId } : {}), // Filter by authUser if userId is passed
            ...(partyId ? { partyId: partyId } : {}), // Filter by partyId if partyId is passed
            paidValue: {
                gte: db.voucher.fields.amount
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
        },
        orderBy: {
            partyId: 'asc'
        }
    });
};

export const getVouchersByPartyByUserAndDateRange = async (voucherGroupId: string, startDate?: Date, endDate?: Date, userId?: any, status?: any) => {
    return db.voucher.findMany({
        where: {
            ...(userId && { authUser: userId }),
            voucherGroupId: voucherGroupId,
            date: {
                gte: startDate,
                lte: endDate,
            },
            isconform: true,
            ...(status && { status: status })
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
        orderBy: { voucherNumber: 'desc' }
    });
};

export const getrejectInvoice = async (vouchergrpId: any, startDate?: Date, endDate?: Date, userId?: any) => {
    return db.voucher.findMany({
        where: {
            ...(userId && { authUser: userId }),
            voucherGroupId: vouchergrpId,
            date: {
                gte: startDate,
                lte: endDate,
            },
            status: 'CANCELLED',
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
        orderBy: { voucherNumber: 'desc' }
    });
}

export const getVouchersByPartyByUserAndDateRangeall = async (voucherGroupId: string, startDate?: Date, endDate?: Date, userId?: any) => {
    return db.voucher.findMany({
        where: {
            ...(userId && { authUser: userId }),
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
        },
        orderBy: { voucherNumber: 'desc' }
    });
};

export const getVouchersByStatusByUser = async (voucherGroupId: any, status?: any, userId?: any) => {
    return db.voucher.findMany({
        where: {
            ...(userId && { authUser: userId }),
            voucherGroupId: voucherGroupId,
            ...(status && {
                OR: status === 'PENDING' ? [
                    { status: 'PENDING' },
                    { status: null }
                ] : [
                    { status: status }
                ]
            }),
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
        orderBy: { date: 'desc' }
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
        },
        orderBy: { date: 'desc' }
    });
};

export const getRefVoucherbychartofacc = async (data: any) => {
    return db.voucher.findMany({
        where: {
            voucherGroupId: data.voucherGroupId,
            chartofAccountId: data.chartofAccountId,
            isRef: false,
            OR: [
                { status: 'PENDING' },
                { status: null },
            ],
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

export const getRefVoucherbyVoucherGrpid = async (data: any, userId?: any) => {
    return db.voucher.findMany({
        where: {
            ...(userId && { authUser: userId }),
            voucherGroupId: data.voucherGroupId,
            partyId: data.partyId,
            isRef: false,
            isconform: true,
            // OR: [
            //     { status: 'PENDING' },
            //     { status: null },
            // ],
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
        },
        orderBy: { voucherNumber: 'desc' }
    });
}

export const getVouchersGroupedByAuthUserWithVisits = async (month?: number, year?: number) => {
    const selectedMonth = month !== undefined ? month - 1 : new Date().getMonth();
    const selectedYear = year !== undefined ? year : new Date().getFullYear();

    // Set start date to the 1st day of the selected month at midnight (local time)
    const startDate = new Date(selectedYear, selectedMonth, 1, 0, 0, 0, 0);

    // Set end date to the last day of the selected month at the end of the day (local time)
    const endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);

    const now = new Date();

    // Set todayStart to the start of today at 00:00:00.000 in local time
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    // Set todayEnd to the end of today at 23:59:59.999 in local time
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    console.log('Monthly range:', startDate.toISOString(), endDate.toISOString());
    console.log('Today range:', todayStart.toISOString(), todayEnd.toISOString());


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
            isconform: true,
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
            isconform: true,
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
            isconform: true,
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
            isconform: true,
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

export const pendingConform = async () => {
    const vouchers = await db.voucher.findMany({
        where: {
            voucherGroupId: "b5c5fabf-2c63-4ef4-8d0d-1330cd200d97",
            isRef: true,
            status: null
        }
    });

    await Promise.all(
        vouchers.map(voucher =>
            db.voucher.update({
                where: { id: voucher.id },
                data: {
                    status: 'COMPLETED'
                }
            })
        )
    );

    return "Updated"
};





