import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate, ExpressRequest } from '../../middleware/auth'

import * as visitingCustomerService from './visitedCustomer.service'
import { role } from "@prisma/client";

export const visitingCustomerRouter = express.Router();

//GET LIST
visitingCustomerRouter.get("/",authenticate, async (request: ExpressRequest, response: Response) => {
    var { startDate, endDate, userId } = request.query;
    console.log(startDate, endDate, userId)
    try {

        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }

        if (request.user.role === role.SALESMEN) {
            userId = request.user?.id;
        }

        const filterStartDate = startDate ? new Date(startDate as string) : new Date();
        filterStartDate.setHours(0, 0, 0, 0); // Set start of the day
        const filterEndDate = endDate ? new Date(endDate as string) : new Date();
        filterEndDate.setHours(23, 59, 59, 999); // Set end of the day

        if (isNaN(filterStartDate.getTime()) || isNaN(filterEndDate.getTime())) {
            return response.status(400).json({ message: "Invalid date format." });
        }

        const data = await visitingCustomerService.list(filterStartDate, filterEndDate, userId);
        return response.status(200).json({ data: data });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
});

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


