import { db } from "../../utils/db.server";

export const list = async () => {
    return db.pettycashIOU.findMany({
        include: {
            pettyCashIOUDetails: true,
            user: {
                select: {
                    username: true
                }
            }
        }
    });
}

export const getbyname = async (id: any) => {
    return db.pettycashIOU.findFirst({
        where: {
            userid: id
        }
    });
}

export const create = async (data: any) => {
    return db.pettycashIOU.create({
        data: data
    });
}

export const update = async (data: any, id: any) => {
    return db.pettycashIOU.update({
        where: { id: id },
        data: data
    });
}