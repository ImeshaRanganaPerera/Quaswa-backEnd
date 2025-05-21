import { db } from "../../utils/db.server";

export const list = async () => {
    return db.accountSubCategory.findMany({
        include: {
            accountCategory: true
        }
    });
}

export const get = async (id: any) => {
    return db.accountSubCategory.findUnique({
        where: {
            id,
        },
    });
}

export const getbyname = async (name: any) => {
    return db.accountSubCategory.findFirst({
        where: {
            accountSubName: name,

        },

    });
}

export const create = async (data: any) => {
    return db.accountSubCategory.create({
        data: data,
        include: {
            accountCategory: true
        }
    });
}

export const update = async (data: any, id: any) => {
    return db.accountSubCategory.update({
        where: id,
        data: data,
        include: {
            accountCategory: true
        }
    });
}