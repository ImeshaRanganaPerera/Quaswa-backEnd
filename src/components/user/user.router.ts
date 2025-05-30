import express from "express";
import type { Request, Response } from "express";
import { authenticate, ExpressRequest } from '../../middleware/auth'
import { sign } from "jsonwebtoken";
import { user } from "@prisma/client";
import { compare } from "bcrypt";
import { hash } from "bcrypt"

import * as UserService from './user.service'
import * as centerService from '../center/center.service'
import * as userCenterService from '../userCenter/userCenter.service'
import * as inventoryService from '../inventory/inventory.service'

const genarateJwt = (user: user): String => {
    return sign({ userId: user.id, name: user.name, role: user.role }, "Skey")
}

export const userRouter = express.Router();

//GET LIST
userRouter.get("/", async (request: Request, res, next) => {
    try {
        const users = await UserService.getlist()
        return res.status(200).json({ data: users });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
})

userRouter.get("/role/:role", authenticate, async (request: ExpressRequest, response: Response) => {
    const role: any = request.params.role;
    try {
        if (!request.user) {
            return response.status(401);
        }
        const user = await UserService.getbyRole(role)
        if (user) {
            return response.status(200).json({ data: user });
        }
        return response.status(404).json("User could not be found");
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

//GET 
userRouter.get("/details", authenticate, async (request: ExpressRequest, response: Response) => {
    try {
        if (!request.user) {
            return response.status(401);
        }
        const user = await UserService.getbyId(request.user.id)
        if (user) {
            return response.status(200).json({ data: user });
        }
        return response.status(404).json("User could not be found");
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

//POST
userRouter.post("/", authenticate, async (request: ExpressRequest, response: Response) => {
    const data: any = request.body;

    if (!request.user) {
        return response.status(401).json({ message: "User not authorized" });
    }

    const createdBy = request.user.id;

    try {
        // Create user
        const newUser = await UserService.create({
            name: data.name,
            nic: data.nic,
            phoneNumber: data.phoneNumber,
            address: data.address,
            dateofbirth: data.dateofbirth,
            target: data.target,
            username: data.username,
            password: data.password,
            role: data.role,
        });

        if (!newUser) {
            return response.status(500).json({ message: "Failed to create user" });
        }

        // Handle role-based logic
        await handleRoleBasedLogic(data, newUser.id, createdBy);

        return response.status(201).json({ message: "User created successfully", data: newUser });

    } catch (error: any) {
        console.error("Error creating user:", error);
        return response.status(500).json({ message: error.message });
    }
});

// Helper function to handle role-based center associations
async function handleRoleBasedLogic(data: any, userId: string, createdBy: string) {
    const { role, centers } = data;

    if (role === "MANAGER" && centers) {
        await associateCentersWithManager(centers, userId);
    } else if (role === "ADMIN") {
        await associateCentersWithAdmin(userId);
    } else if (role === "SALESMEN") {
        await createAndAssociateCenterForSalesmen(data.name, userId, createdBy);
    }
}

// Function to associate centers with a manager
async function associateCentersWithManager(centers: { centerId: string }[], userId: string) {
    const centerPromises = centers.map(async (center) => {
        const userCenter = await userCenterService.create({
            userId,
            centerId: center.centerId
        });
        if (!userCenter) {
            throw new Error("Failed to update center association");
        }
    });

    await Promise.all(centerPromises);
}

// Function to associate centers with an admin
async function associateCentersWithAdmin(userId: string) {
    const centerList = await centerService.getCenterMode("PHYSICAL");

    const centerPromises = centerList.map(async (center) => {
        const userCenter = await userCenterService.create({
            userId,
            centerId: center.id
        });
        if (!userCenter) {
            throw new Error("Failed to update center association");
        }
    });

    await Promise.all(centerPromises);
}

// Function to create and associate a center for salesmen
async function createAndAssociateCenterForSalesmen(centerName: string, userId: string, createdBy: string) {
    const newCenter = await centerService.create({ centerName, createdBy });

    if (!newCenter) {
        throw new Error("Failed to create center");
    }

    const userCenter = await userCenterService.create({ userId, centerId: newCenter.id });

    if (!userCenter) {
        throw new Error("Failed to update center association");
    }
}

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

        const companyDetails = await UserService.getAllCompanyDetails();

        const data = {
            token: genarateJwt(user),
            name: user.name,
            role: user.role,
            companyDetails: companyDetails
        }

        return response.status(201).json({ message: 'Login Successfully', data: data });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

userRouter.put("/change-password", authenticate, async (request: ExpressRequest, response: Response) => {
    const { oldPassword, newPassword } = request.body;

    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }
        const userId = request.user.id;

        // Fetch the user by ID
        const user = await UserService.get(userId);
        if (!user) {
            return response.status(404).json({ message: "User not found" });
        }

        // Compare the old password with the stored password
        const isOldPasswordCorrect = await compare(oldPassword, user.password);
        if (!isOldPasswordCorrect) {
            return response.status(400).json({ message: "Old password is incorrect" });
        }

        // Hash the new password
        const hashedNewPassword = await hash(newPassword, 10);

        // Update the password in the database
        const updatedUser = await UserService.updatePassword(userId, hashedNewPassword);

        return response.status(200).json({ message: "Password updated successfully", data: updatedUser });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
});

userRouter.put("/deleteUser/:id", authenticate, async (request: ExpressRequest, response: Response) => {
    const id = request.params.id;

    try {
        if (!request.user) {
            return response.status(401).json({ message: "Unauthorized" });
        }

        const center = await userCenterService.getbyId(id);
        if (!center) {
            return response.status(404).json({ message: "Center not found" });
        }

        const centerProducts = await inventoryService.getbyCenter(center.centerId); 

        const hasProducts = centerProducts.some((product: any) => product.quantity > 0);
        if (hasProducts) {
            return response.status(400).json({ message: "Cannot delete user as there are products in the center" });
        }

        const updateUser = await UserService.deleteUser(id);
        if (updateUser) {
            return response.status(201).json({ message: "User Delete successfully", data: updateUser });
        } else {
            return response.status(404).json({ message: "User not found or could not be deleted" });
        }

    } catch (error: any) {
        return response.status(500).json({ error: error.message });
    }
});


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
            return response.status(201).json({ message: "User updated successfully", data: updateUser });
        }

    } catch (error: any) {
        return response.status(500).json({ data: error.message });
    }
})




// Change Password



