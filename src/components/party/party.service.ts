import { db } from "../../utils/db.server";

export const list = async (id: any) => {
    return db.party.findMany({
        where: {
            partyGroupId: id,
        },
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
        },
    });
}

export const get = async (id: any) => {
    if (!id) throw new Error("ID is required");
    
    return await db.party.findUnique({
        where: { id },
    });
};

export const phoneNumberCheck = async (phoneNumber: any) => {
    return db.party.findFirst({
        where: {
            phoneNumber,
        },
    })
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
                    name: true,
                },
            },
        },
        orderBy: {
            partyCategory: {
                category: 'asc'
            }
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
        where: { id },
        data: data,
        include: {
            partyCategory: {
                select: {
                    category: true
                }
            },
            user: {
                select: {
                    name: true,
                },
            },
        }
    }).then(party => {
        return {
            ...party,
            userName: party.user?.name,  // Rename 'name' to 'userName'
            user: undefined  // Optionally remove the original user object if not needed
        };
    });
};
