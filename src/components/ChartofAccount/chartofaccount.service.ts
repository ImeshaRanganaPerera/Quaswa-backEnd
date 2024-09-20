import { db } from "../../utils/db.server";

export const list = async () => {
    return db.chartofAccount.findMany({
        include: {
            accGroup: true,
            AccountSubCategory: true
        }
    });
}

export const get = async (id: any) => {
    return db.chartofAccount.findUnique({
        where: {
            id,
        },

    });
}

export const getbyname = async (name: string) => {
    return db.chartofAccount.findFirst({
        where: {
            accountName: name
        }
    })
}

export const create = async (data: any) => {
    return db.chartofAccount.create({
        data: data,
        include: {
            accGroup: true,
            AccountSubCategory: true
        }
    });
}

export const updates = async (data: any, id: any) => {
    return db.chartofAccount.update({
        where: { id },
        data: data,
        include: {
            accGroup: true,
            AccountSubCategory: true
        }
    });
}

export const update = async (data: any, id: any) => {
    return db.chartofAccount.update({
        where: id,
        data: data,
        include: {
            accGroup: true,
            AccountSubCategory: true
        }
    });
}

