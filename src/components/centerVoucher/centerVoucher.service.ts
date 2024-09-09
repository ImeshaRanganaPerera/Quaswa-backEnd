import { db } from "../../utils/db.server";

export const getlist = async () => {
    return db.voucherCenter.findMany();
}

// export const get = async (id: any) => {
//     return db.voucherCenter.findUnique({
//         where: {
//             id,
//         }
//     });
// }

// export const getCenterMode = async (mode: any) => {
//     return db.voucherCenter.findMany({
//         where: { mode: mode }
//     });
// }

export const create = async (data: any) => {
    return db.voucherCenter.create({
        data: data
    });
}

export const update = async (data: any, id: any) => {
    return db.voucherCenter.update({
        where: id,
        data: data
    });
}