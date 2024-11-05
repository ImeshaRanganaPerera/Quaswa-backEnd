import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate, ExpressRequest } from '../../middleware/auth'

import * as commissionReportService from './commissionReport.service'

export const commissionReportRouter = express.Router();

//GET LIST
commissionReportRouter.get("/", async (request: Request, response: Response) => {
    try {
        const data = await commissionReportService.list()
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Commission Rate not be found" });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

//GET 
commissionReportRouter.get("/:id", async (request: Request, response: Response) => {
    const id: any = request.params.id;
    try {
        const data = await commissionReportService.get(id)
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Commission Rate not be found" });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

//POST
commissionReportRouter.post("/", authenticate, async (request: ExpressRequest, response: Response) => {
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
        const newbrand = await commissionReportService.create(data)

        if (newbrand) {
            return response.status(201).json({ message: "Commission Rate Created Successfully", data: newbrand });
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

commissionReportRouter.put("/:id", authenticate, async (request: ExpressRequest, response: Response) => {
    const id: any = request.params;
    const data: any = request.body;

    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }
        const updateBrand = await commissionReportService.update(data, id)

        if (updateBrand) {
            return response.status(201).json({ message: "Commission Rate Updated Successfully", data: updateBrand });
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})


