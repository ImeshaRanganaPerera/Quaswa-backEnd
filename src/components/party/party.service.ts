import { db } from "../../utils/db.server";

export const list = async () => {
    return db.party.findMany({
        include: {
            user: {
                select: {
                    name: true
                }
            },
            partyCategory: {
                select: {
                    category: true
                }
            },
        }
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
            },
            user: {
                select: {
                    name: true,  // Original name
                },
                // Change 'name' to 'userName' in the result
                // You can map the result afterwards to create the desired structure.
            },
        }
    }).then(parties => {
        return parties.map(party => ({
            ...party,
            userName: party.user?.name,  // Rename 'name' to 'userName'
            user: undefined  // Optionally remove the original user object if not needed
        }));
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
        include: {
            partyCategory: {
                select: {
                    category: true
                }
            }
        }

    });
}

export const updatewithImage = async (data: any, id: any) => {
    return db.party.update({
        where: {id},
        data: data,
        include: {
            partyCategory: {
                select: {
                    category: true
                }
            }
        }

    });
}