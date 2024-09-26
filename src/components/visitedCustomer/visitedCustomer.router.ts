import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate, ExpressRequest } from '../../middleware/auth'

import * as visitingCustomerService from './visitedCustomer.service'

export const visitingCustomerRouter = express.Router();

//GET LIST
visitingCustomerRouter.get("/", async (request: Request, response: Response) => {
    try {
        const data = await visitingCustomerService.list()
        return response.status(200).json({ data: data });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

//GET 
visitingCustomerRouter.get("/:id", async (request: Request, response: Response) => {
    const id: any = request.params.id;
    try {
        const data = await visitingCustomerService.get(id)
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Visited Customer could not be found" });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

//POST
visitingCustomerRouter.post("/", authenticate, async (request: ExpressRequest, response: Response) => {
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
        const newRecord = await visitingCustomerService.create(data)

        if (newRecord) {
            return response.status(201).json({ message: "Recored Saved Successfully", data: newRecord });
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

visitingCustomerRouter.put("/:id", authenticate, async (request: ExpressRequest, response: Response) => {
    const id: any = request.params;
    const data: any = request.body;

    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }
        const updateRecord = await visitingCustomerService.update(data, id)

        if (updateRecord) {
            return response.status(201).json({ message: "Visited Customer Updated Successfully", data: updateRecord });
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})


