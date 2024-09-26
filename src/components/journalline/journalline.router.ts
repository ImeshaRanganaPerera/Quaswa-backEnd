import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate, ExpressRequest } from '../../middleware/auth'

import * as jornalLineService from './journalline.service'

export const journalLineRouter = express.Router();

//GET LIST
journalLineRouter.get("/", async (request: Request, response: Response) => {
    try {
        const data = await jornalLineService.list()
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Jorual List could not be found" });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

journalLineRouter.get("/ref/:name", async (request: Request, response: Response) => {
    const name: any = request.params.name;
    try {
        const data = await jornalLineService.getbyRef(name)
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Jorual List could not be found" });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

//GET 
journalLineRouter.get("/:id", async (request: Request, response: Response) => {
    const id: any = request.params.id;
    try {
        const data = await jornalLineService.get(id)
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Jorunal Lines could not be found" });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

//POST
journalLineRouter.post("/", authenticate, async (request: ExpressRequest, response: Response) => {
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
        const newbrand = await jornalLineService.create(data)

        if (newbrand) {
            return response.status(201).json({ message: "Jorunal Line Created Successfully", data: newbrand });
        }
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

journalLineRouter.put("/:id", authenticate, async (request: ExpressRequest, response: Response) => {
    const id: any = request.params;
    const data: any = request.body;

    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }
        const updateBrand = await jornalLineService.update(data, id)

        if (updateBrand) {
            return response.status(201).json({ message: "Jorunal Line Updated Successfully", data: updateBrand });
        }
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

