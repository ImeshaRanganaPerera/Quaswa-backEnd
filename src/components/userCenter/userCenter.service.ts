import { db } from "../../utils/db.server";

export const getlist = async () => {
    return db.userCenter.findMany();
}

// export const get = async (id: any) => {
//     return db.userCenter.findUnique({
//         where: {
//             id,
//         }
//     });
// }

export const create = async (data: any) => {
    return db.userCenter.create({
        data: data
    });
}

export const update = async (data: any, id: any) => {
    return db.userCenter.update({
        where: id,
        data: data
    });
}