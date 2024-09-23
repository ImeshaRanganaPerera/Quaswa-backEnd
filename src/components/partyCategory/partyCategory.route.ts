import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate, ExpressRequest } from '../../middleware/auth'

import * as partyCategoryService from './partyCategory.service'
import * as partyGroupService from '../partyGroup/partyGroup.service'


export const partyCategoryRouter = express.Router();

//GET LIST
partyCategoryRouter.get("/", async (request: Request, response: Response) => {
    try {
        const partyCategory = await partyCategoryService.getlist()
        if (partyCategory) {
            return response.status(200).json({ data: partyCategory });
        }
        return response.status(404).json({ message: "Party Category could not be found" });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

//POST
partyCategoryRouter.post("/", authenticate, async (request: ExpressRequest, response: Response) => {
    var data: any = request.body;
    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }

        const cutomer = await partyGroupService.getbyname('CUSTOMER')

        const userId = request.user.id;
        data = {
            ...data,
            partyGroupId: cutomer?.id,
            createdBy: userId
        }
        const newbrand = await partyCategoryService.create(data)

        if (newbrand) {
            return response.status(201).json({ message: "Party Category Successfully", data: newbrand });
        }
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

partyCategoryRouter.put("/:id", authenticate, async (request: ExpressRequest, response: Response) => {
    const id: any = request.params;
    const data: any = request.body;

    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }
        const updatepartyCategory = await partyCategoryService.update(data, id)
        if (updatepartyCategory) {
            return response.status(201).json({ message: "Party Category Updated Successfully", data: updatepartyCategory });
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

