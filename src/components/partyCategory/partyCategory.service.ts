import { db } from "../../utils/db.server";


export const getlist = async () => {
    const customer = await db.partyGroup.findFirst({
        where: { partyGroupName: "CUSTOMER" }
    })

    return db.partyCategory.findMany({
        where: { partyGroupId: customer?.id }
    });
}

export const getbyname = async (name: any) => {
    return db.partyCategory.findFirst({
        where: {
            category: name
        }
    });
}

export const getbyid = async (id: any) => {
    return db.partyCategory.findUnique({
        where: {
            id
        }
    });
}

export const create = async (data: any) => {
    return db.partyCategory.create({
        data: data
    });
}

export const update = async (data: any, id: any) => {
    return db.partyCategory.update({
        where: id,
        data: data
    });
}