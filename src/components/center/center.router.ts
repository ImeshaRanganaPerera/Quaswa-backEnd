import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate, ExpressRequest } from '../../middleware/auth'

import * as centerService from './center.service'
import * as userService from '../user/user.service'
import * as userCenterService from '../userCenter/userCenter.service'
import * as productService from '../product/product.service'
import * as inventoryService from '../inventory/inventory.service'

export const centerRouter = express.Router();

//GET
centerRouter.get("/", async (request: Request, response: Response) => {
    try {
        const data = await centerService.getlist();
        return response.status(200).json({ data: data, message: "" });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

//GET
centerRouter.get("/:id", async (request: Request, response: Response) => {
    const id: any = request.params.id;
    try {
        const data = await centerService.get(id)
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Center could not be found" });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

//POST
centerRouter.post("/", authenticate, async (request: ExpressRequest, response: Response) => {
    var data: any = request.body;
    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }
        const createdBy = request.user.id;
        var data = { ...data, createdBy };
        const newCenter = await centerService.create(data)

        if (data.mode === "PHYSICAL") {
            const adminUsers = await userService.getbyRole("ADMIN")

            const centerPromises = adminUsers.map(async (user: { id: string }) => {
                const userCenter = await userCenterService.create({
                    userId: user.id,
                    centerId: newCenter.id
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

        if (newCenter) {
            const productList = await productService.list()

            const centerPromises = productList.map(async (product: { id: string }) => {
                const inventory = await inventoryService.upsert({
                    productId: product.id,
                    centerId: newCenter.id,
                    quantity: 0,
                    cost: 0,
                    minPrice: 0,
                    MRP: 0,
                    salePrice: 0
                });
                if (!inventory) {
                    throw new Error("Failed to update inventory association");
                }
            });

            try {
                await Promise.all(centerPromises);
            } catch (error: any) {
                return response.status(500).json({ message: error.message });
            }

            return response.status(201).json({ data: data, message: "Center Created Successfully" });
        }
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

//UPDATE
centerRouter.put("/:id", async (request: Request, response: Response) => {
    const id: any = request.params;
    const data: any = request.body;
    try {
        const updateparty = await centerService.update(data, id)
        if (updateparty) {
            return response.status(201).json({ message: "Customer Updated Successfully" });
        }
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})
