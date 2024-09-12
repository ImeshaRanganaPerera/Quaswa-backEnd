import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate, ExpressRequest } from '../../middleware/auth'

import * as accountGroup from './accountGroup.service'

export const brandRouter = express.Router();

//GET LIST
brandRouter.get("/", async (request: Request, response: Response) => {
    try {
        const data = await accountGroup.list()
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Brand could not be found" });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

//GET 
brandRouter.get("/:id", async (request: Request, response: Response) => {
    const id: any = request.params.id;
    try {
        const data = await accountGroup.get(id)
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Brand could not be found" });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

//POST
brandRouter.post("/", authenticate, async (request: ExpressRequest, response: Response) => {
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
        const newbrand = await accountGroup.create(data)

        if (newbrand) {
            return response.status(201).json({ message: "Brand Created Successfully", data: newbrand });
        }
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

brandRouter.put("/:id", authenticate, async (request: ExpressRequest, response: Response) => {
    const id: any = request.params;
    const data: any = request.body;

    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }
        const updateBrand = await accountGroup.update(data, id)

        if (updateBrand) {
            return response.status(201).json({ message: "Brand Updated Successfully", data: updateBrand });
        }
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})


