import { db } from "../../utils/db.server";

export const list = async () => {
    return db.vistingCustomer.findMany({
        include: {
            party: {
                select: {
                    name: true
                }
            },
            user: {
                select: {
                    name: true
                }
            }
        }
    });
}

export const get = async (id: any) => {
    return db.vistingCustomer.findUnique({
        where: {
            id,
        },
    });
}

export const create = async (data: any) => {
    return db.vistingCustomer.create({
        data: data
    });
}

export const update = async (data: any, id: any) => {
    return db.vistingCustomer.update({
        where: id,
        data: data
    });
}