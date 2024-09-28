import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate, ExpressRequest } from '../../middleware/auth'

import * as partyTypeService from './partyType.service'

export const partyTypeRouter = express.Router();

//GET LIST
partyTypeRouter.get("/", async (request: Request, response: Response) => {
    try {
        const partyType = await partyTypeService.getlist()
        if (partyType) {
            return response.status(200).json({ data: partyType });
        }
        return response.status(404).json({ message: "Party Type could not be found" });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

//POST
partyTypeRouter.post("/", authenticate, async (request: ExpressRequest, response: Response) => {
    var data: any = request.body;
    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }
        const userId = request.user.id;
        data = {
            ...data,
            createdBy: userId
        }
        const partyType = await partyTypeService.create(data)

        if (partyType) {
            return response.status(201).json({ message: "Party Type Successfully", data: partyType });
        }
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

partyTypeRouter.put("/:id", authenticate, async (request: ExpressRequest, response: Response) => {
    const id: any = request.params;
    const data: any = request.body;

    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }
        const updatepartyType = await partyTypeService.update(data, id)
        if (updatepartyType) {
            return response.status(201).json({ message: "Party Type Updated Successfully", data: updatepartyType });
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

