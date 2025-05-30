import { db } from "../../utils/db.server";

export const list = async () => {
    return db.oemnumber.findMany();
}

// export const get = async (id: any) => {
//     return db.oEMNumber.findUnique({
//         where: {
//             id,
//         },
//     });
// }

export const create = async (data: any) => {
    return db.oemnumber.create({
        data: data
    });
}

export const update = async (data: any, id: any) => {
    return db.oemnumber.update({
        where: id,
        data: data
    });
}

export const deleteOEMNumbers = async (id: string) => {
    return db.oemnumber.deleteMany({
        where: {
            productId: id
        }
    });
};