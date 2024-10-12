import { db } from "../../utils/db.server";

export const getCentersByUserId = async (userId: string) => {
  return db.userCenter.findMany({
    where: {
      userId: userId
    },
    include: {
      center: true  // This will include the Center details associated with each userCenter record
    }
  });
};

// export const get = async (id: any) => {
//     return db.userCenter.findUnique({
//         where: {
//             id,
//         }
//     });
// }

export const getbyId = async (id: any) => {
  return db.userCenter.findFirst({
    where: {
      userId: id,
    },
  });
}


export const create = async (data: any) => {
  return db.userCenter.create({
    data: data
  });
}

export const update = async (data: any, id: any) => {
  return db.userCenter.update({
    where: id,
    data: data
  });
}