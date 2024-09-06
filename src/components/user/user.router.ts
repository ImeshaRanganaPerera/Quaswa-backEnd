import express from "express";
import type { Request, Response } from "express";
import { authenticate, ExpressRequest } from '../../middleware/auth'
import { sign } from "jsonwebtoken";
import { User } from "@prisma/client";
import { compare } from "bcrypt";

import * as UserService from './user.service'
import * as centerService from '../center/center.service'
import * as userCenterService from '../userCenter/userCenter.service'

const genarateJwt = (user: User): String => {
    return sign({ userId: user.id, name: user.name, role: user.role }, "Skey")
}

export const userRouter = express.Router();

//GET LIST
userRouter.get("/", async (request: Request, res, next) => {
    try {
        const users = await UserService.getlist()
        return res.status(200).json(users);
    } catch (error: any) {
        return res.status(500).json(error.message);
    }
})

//GET 
userRouter.get("/:id", authenticate, async (request: ExpressRequest, response: Response) => {
    const id: any = request.params.id;
    try {
        if (!request.user) {
            return response.status(401);
        }

        const user = await UserService.get(id)
        if (user) {
            return response.status(200).json(user);
        }
        return response.status(404).json("User could not be found");
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

//POST
userRouter.post("/", authenticate, async (request: ExpressRequest, response: Response) => {
    const data: any = request.body;
    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }

        const createdBy = request.user.id;

        if (data.centers) {
            if (data.centers && data.role === "MANAGER") {
                let centers = data.centers
                delete data.centers
                console.log(data.centers)

                var newUser = await UserService.create(data);

                if (!newUser) {
                    return response.status(500).json({ message: "Failed to create user" });
                }

                const centerPromises = centers.map(async (center: { centerId: string }) => {
                    const userCenter = await userCenterService.create({
                        userId: newUser.id,
                        centerId: center.centerId
                    });
                    if (!userCenter) {
                        throw new Error("Failed to update center association");
                    }
                });

                try {
                    await Promise.all(centerPromises);
                } catch (error: any) {
                    return response.status(500).json({ message: error.message });
                }
            }

            return response.status(201).json({ message: "User created successfully" });
        }


        // Handle user creation
        var newUser = await UserService.create(data);

        if (!newUser) {
            return response.status(500).json({ message: "Failed to create user" });
        }

        if (data.role === "ADMIN") {
            const centerList = await centerService.getCenterMode("PHYSICAL")

            const centerPromises = centerList.map(async (center: { id: string }) => {
                const userCenter = await userCenterService.create({
                    userId: newUser.id,
                    centerId: center.id
                });
                if (!userCenter) {
                    throw new Error("Failed to update center association");
                }
            });

            try {
                await Promise.all(centerPromises);
            } catch (error: any) {
                return response.status(500).json({ message: error.message });
            }
        }


        // If role is "SALESMEN", create a new center and associate it with the user
        if (!data.role) {
            const newCenter = await centerService.create({ centerName: data.name, createdBy });

            if (!newCenter) {
                return response.status(500).json({ message: "Failed to create center" });
            }

            const userCenter = await userCenterService.create({ userId: newUser.id, centerId: newCenter.id });

            if (!userCenter) {
                return response.status(500).json({ message: "Failed to update center association" });
            }
        }

        return response.status(201).json({ message: "User created successfully" });
    } catch (error: any) {
        console.error("Error creating user:", error);
        return response.status(500).json({ message: error.message });
    }
});

//LOGIN
userRouter.post("/login", async (request: Request, response: Response) => {
    const userData: any = request.body;
    try {
        const user = await UserService.login(userData.username)
        if (!user) {
            return response.status(404).json({ message: "Username or Password Incorrect!" })
        }
        const isPasswordCorrect = await compare(userData.password, user.password)

        if (!isPasswordCorrect) {
            return response.status(404).json({ message: "Username or Password Incorrect!" })
        }
        const data = {
            token: genarateJwt(user),
            name: user.name
        }
        return response.status(201).json({ message: 'Login Successfully', data: data });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

//UPDATE
userRouter.put("/:id", authenticate, async (request: ExpressRequest, response: Response) => {
    const id: any = request.params;
    const userData: any = request.body;
    try {
        if (!request.user) {
            return response.status(401);
        }

        const updateUser = await UserService.update(userData, id)
        if (updateUser) {
            return response.status(201).json(updateUser);
        }

    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})


