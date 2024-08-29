import { db } from "../../utils/db.server";

export const getlist = async () => {
    return db.partyGroup.findMany();
}

export const getbyname = async (name: any) => {
    return db.partyGroup.findFirst({
        where: {
            partyGroupName: name
        }
    });
}

export const getbyid = async (id: any) => {
    return db.partyGroup.findUnique({
        where: {
            id
        }
    });
}

export const create = async (data: any) => {
    return db.partyGroup.create({
        data: data
    });
}

export const update = async (data: any, id: any) => {
    return db.partyGroup.update({
        where: id,
        data: data
    });
}