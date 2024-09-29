import { db } from "../../utils/db.server";

export const list = async () => {
    return db.party.findMany({

    });
}

export const get = async (id: any) => {
    return db.party.findUnique({
        where: {
            id,
        },
    });
}

export const getbyGroup = async (id: any, condition: boolean) => {
    return db.party.findMany({
        where: {
            partyGroupId: id,
            isVerified: condition
        },
        include: {
            partyCategory: {
                select: {
                    category: true
                }
            }
        }
    });
}

export const create = async (data: any) => {
    return db.party.create({
        data: data
    },
    );
}

export const update = async (data: any, id: any) => {
    return db.party.update({
        where: id,
        data: data,
        include: { partyCategory: { select: { category: true } } }
    });
}