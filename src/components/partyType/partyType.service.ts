import { db } from "../../utils/db.server";

export const getlist = async () => {
    return db.partyType.findMany();
}

export const getbyname = async (name: any) => {
    return db.partyType.findFirst({
        where: {
            type: name
        }
    });
}

export const getbyid = async (id: any) => {
    return db.partyType.findUnique({
        where: {
            id
        }
    });
}

export const create = async (data: any) => {
    return db.partyType.create({
        data: data
    });
}

export const update = async (data: any, id: any) => {
    return db.partyType.update({
        where: id,
        data: data
    });
}