import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate, ExpressRequest } from '../../middleware/auth'

import * as partyService from './party.service'
import * as partyGroupService from '../partyGroup/partyGroup.service'
import { getbyGroup } from './party.service';

export const partyRouter = express.Router();

//GET LIST
partyRouter.get("/", async (request: Request, response: Response) => {
    try {
        const party = await partyService.list()
        if (party) {
            return response.status(200).json({ data: party });
        }
        return response.status(404).json({ message: "Party could not be found" });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

//GET 
partyRouter.get("/:id", async (request: Request, response: Response) => {
    const id: any = request.params.id;
    try {
        const party = await partyService.get(id)
        if (party) {
            return response.status(200).json({ data: party });
        }
        return response.status(404).json({ message: "Party could not be found" });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

partyRouter.get("/partygroup/:name", async (request: Request, response: Response) => {
    const name: any = request.params.name;
    try {
        const partyGroup = await partyGroupService.getbyname(name)
        const party = await partyService.getbyGroup(partyGroup?.id)
        if (party) {
            return response.status(200).json({ data: party });
        }
        return response.status(404).json({ message: "Party could not be found" });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

//POST
partyRouter.post("/", authenticate, async (request: ExpressRequest, response: Response) => {
    const data: any = request.body;
    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }
        const userId = request.user.id;
        if (!data.partyGroup) {
            return response.status(401).json({ message: "Party Group Undefined" });
        }

        const partyGroup = await partyGroupService.getbyname(data.partyGroup)
        if (!partyGroup) {
            return response.status(401).json({ message: "Party Group Invalid" });
        }
        const newParty = await partyService.create({ name: data.name, nic: data.nic, phoneNumber: data.phoneNumber, creditPeriod: data.creditPeriod, creditValue: data.creditValue, address1: data.address1, address2: data.address2, email: data.email, partyGroupId: partyGroup?.id, createdBy: userId })

        if (newParty) {
            return response.status(201).json({ message: data.partyGroup + " Created Successfully", data: newParty });
        }
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

partyRouter.put("/:id", authenticate, async (request: ExpressRequest, response: Response) => {
    const id: any = request.params;
    const data: any = request.body;

    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }
        const updateparty = await partyService.update({ name: data.name, nic: data.nic, phoneNumber: data.phoneNumber, creditPeriod: data.creditPeriod, creditValue: data.creditValue, address1: data.address1, address2: data.address2, email: data.email }, id)
        const partyGroup = await partyGroupService.getbyid(updateparty.partyGroupId)

        if (updateparty) {
            return response.status(201).json({ message: partyGroup?.partyGroupName + " Updated Successfully", data: updateparty });
        }
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})


