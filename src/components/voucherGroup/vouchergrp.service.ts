import { db } from "../../utils/db.server";

export const list = async () => {
    return db.voucherGroup.findMany({});
}

export const getbyname = async (name: any) => {
    return db.voucherGroup.findFirst({
        where: {
            voucherName: name,
        }
    });
}

export const create = async (data: any) => {
    return db.voucherGroup.create({
        data: data
    });
}

// export const updateVoucherGrp = async (Data: any, id: any) => {
//     return db.voucherGroup.update();
// }
