import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate, ExpressRequest } from '../../middleware/auth'

import * as inventoryService from './inventory.service'
import * as usercenterService from '../userCenter/userCenter.service'
import { Role } from '@prisma/client';
export const inventoryRouter = express.Router();

inventoryRouter.get("/filter", authenticate, async (request: ExpressRequest, response: Response) => {
    var { productId, centerId } = request.query;
    console.log(centerId)
    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }

        if (request.user.role === Role.SALESMEN) {
            const center = await usercenterService.getbyId(request.user.id);
            if (centerId === undefined) {
                centerId = center?.centerId;
            }
        }
        
        const filteredInventory = await inventoryService.filterInventory(
            productId?.toString(),
            centerId?.toString()
        );
        return response.status(200).json({ data: filteredInventory });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
});

inventoryRouter.get("/stock", authenticate, async (request: ExpressRequest, response: Response) => {
    var { productId, centerId, date } = request.query;
    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }

        if (request.user.role === Role.SALESMEN) {
            const center = await usercenterService.getbyId(request.user.id);
            if (!centerId) {
                centerId = center?.centerId;
            }
        }
        const filteredInventory = await inventoryService.filterVoucherProduct(
            productId?.toString(),
            centerId?.toString(),
            date ? new Date(date.toString()) : new Date()
        );
        return response.status(200).json({ data: filteredInventory });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
});


//GET LIST
inventoryRouter.get("/:id", async (request: Request, response: Response) => {
    const id: any = request.params.id;
    try {
        const inventory = await inventoryService.getbyCenter(id)
        if (inventory) {
            return response.status(200).json({ data: inventory });
        }
        return response.status(404).json({ message: "Inventory could not be found" });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})






