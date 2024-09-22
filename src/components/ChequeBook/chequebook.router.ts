import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate, ExpressRequest } from '../../middleware/auth'

import * as chequebookservice from './chequebook.service'

export const chequebookRoute = express.Router();

//GET
chequebookRoute.get("/", async (request: Request, response: Response) => {
    try {
        const data = await chequebookservice.list();
        return response.status(200).json({ data: data });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

//GET
chequebookRoute.get("/:id", async (request: Request, response: Response) => {
    const id: any = request.params.id;
    try {
        const data = await chequebookservice.get(id)
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "chequebook could not be found" });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

//POST
chequebookRoute.post("/", authenticate, async (request: ExpressRequest, response: Response) => {
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
        console.log(data)
        const newChequeBook = await chequebookservice.create(data)


        if (newChequeBook) {
            return response.status(201).json({ message: "Chequebook Created Successfully", data: newChequeBook });
        }
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

//UPDATE
chequebookRoute.put("/:id", async (request: Request, response: Response) => {
    const id: any = request.params;
    const data: any = request.body;
    try {
        const updatechequebook = await chequebookservice.update(data, id)
        if (updatechequebook) {
            return response.status(201).json({ message: "Chequebook Updated Successfully", data: updatechequebook });
        }
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})