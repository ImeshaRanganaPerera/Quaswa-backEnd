import { db } from "../../utils/db.server";

export const list = async () => {
    return db.voucherGroup.findMany({});
}

export const getsidemenu = async () => {
    return db.voucherGroup.findMany({
        where: {
            isSidemenu: true
        },
        select: {
            label: true,
            category: true,
            voucherName: true
        }
    });
}

export const getbyname = async (name: any) => {
    return db.voucherGroup.findFirst({
        where: {
            voucherName: name,
        }
    });
}

export const getById = async (id: any) => {
    return db.voucherGroup.findFirst({
        where: {
            id: id,
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
