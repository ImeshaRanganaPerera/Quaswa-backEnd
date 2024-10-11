import { db } from "../../utils/db.server";

export const list = async () => {
    return db.referVouchers.findMany({});
}

export const getbyvoucher = async (id: any) => {
    return db.referVouchers.findMany({
        where: {
            voucherId: id,
        },
        include: {
            voucher: {
                select: {
                    voucherNumber: true,
                    party: {
                        select: {
                            name: true,
                        }
                    }
                }
            }
        }
    });
}

export const create = async (data: any) => {
    return db.referVouchers.create({
        data: data
    });
}

// export const updateVoucherGrp = async (Data: any, id: any) => {
//     return db.referVouchers.update();
// }
