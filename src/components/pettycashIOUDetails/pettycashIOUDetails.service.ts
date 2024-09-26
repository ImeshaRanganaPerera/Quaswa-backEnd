import { db } from "../../utils/db.server";

export const list = async () => {
    return db.pettyCashIOUDetails.findMany({});
}

export const getbyname = async (name: any) => {
    return db.pettyCashIOUDetails.findFirst({
        where: {
            id: name
        }
    });
}

export const create = async (data: any) => {
    return db.pettyCashIOUDetails.create({
        data: data
    });
}

export const update = async (data: any, id: any) => {
    return db.pettyCashIOUDetails.update({
        where: id,
        data: data
    });
}

export const deletebyIOUId = async (id: any) => {
    return db.pettyCashIOUDetails.deleteMany({
        where: {
            pettycashIOUId: id
        }
    });
}