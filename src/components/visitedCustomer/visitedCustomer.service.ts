import { db } from "../../utils/db.server";

export const list = async (startdate: any, enddate: any, userId?: any) => {
    return db.vistingCustomer.findMany({
        where: {
            ...(userId && {createdBy: userId }),
            createdAt: {
                gte: startdate,
                lte: enddate,
            },
        },
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