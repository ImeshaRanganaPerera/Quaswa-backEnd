import { db } from "../../utils/db.server";

export const list = async () => {
    return db.oEMNumber.findMany();
}

// export const get = async (id: any) => {
//     return db.oEMNumber.findUnique({
//         where: {
//             id,
//         },
//     });
// }

export const create = async (data: any) => {
    return db.oEMNumber.create({
        data: data
    });
}

export const update = async (data: any, id: any) => {
    return db.oEMNumber.update({
        where: id,
        data: data
    });
}

export const deleteOEMNumbers = async (id: string) => {
    return db.oEMNumber.deleteMany({
        where: {
            productId: id
        }
    });
};