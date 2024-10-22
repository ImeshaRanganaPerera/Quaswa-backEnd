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
    console.log(productId, centerId, date)
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

inventoryRouter.get("/stockMovement", authenticate, async (request: Request, response: Response) => {
    let { productId, centerId, date } = request.query;

    try {
        // Parse the date from query or use the current date
        const parsedDate = date ? new Date(date.toString()) : new Date();

        // Ensure productId and centerId are strings (or empty strings if undefined)
        const productIdStr = productId?.toString() || "";
        const centerIdStr = centerId?.toString() || "";

        // Fetch stock movement based on productId, centerId, and date
        const stockMovement = await inventoryService.filterStockMovement(
            productIdStr,
            centerIdStr,
            parsedDate
        );

        // If no records found, return a message
        if (Array.isArray(stockMovement) && !stockMovement.length) {
            return response.status(404).json({ message: "No records found for the given criteria." });
        }

        // Return stock movement data
        return response.status(200).json({ data: stockMovement });
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

// inventoryRouter.put("/", authenticate, async (request: ExpressRequest, response: Response) => {
//     const data: any = request.body;
//     console.log(data)
//     try {
//         if (!request.user) {
//             return response.status(401).json({ message: "User not authorized" });
//         }
//         const inventoryUpdate = await inventoryService.updates(data, data.productId, data.centerId)

//         if (inventoryUpdate) {
//             return response.status(201).json({ message: "Inventory Updated Successfully", data: inventoryUpdate });
//         }
//     } catch (error: any) {
//         return response.status(500).json(error.message);
//     }
// })








