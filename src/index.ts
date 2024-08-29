import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";

import { userRouter } from "./components/user/user.router";
import { centerRouter } from "./components/center/center.router";
import { partyRouter } from "./components/party/party.router";
import { brandRouter } from "./components/brand/brand.router";
import { typeRouter } from "./components/type/type.router";
import { productRouter } from "./components/product/prouct.router";
import { voucherRouter } from "./components/voucher/voucher.router";
// import { itemRouter } from "./components/items/item.router";
// import { cusDetailRouter } from "./components/customerDetails/customerDetails.route";

dotenv.config();

if (!process.env.PORT) {
    process.exit(1);
}

const PORT: number = parseInt(process.env.PORT as string, 10);

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/users", userRouter)
app.use("/api/center", centerRouter)
app.use("/api/party", partyRouter)
app.use("/api/brand", brandRouter)
app.use("/api/type", typeRouter)
app.use("/api/product", productRouter)
app.use("/api/voucher", voucherRouter)
// app.use("/api/items", itemRouter)
// app.use("/api/cusDetail", cusDetailRouter)

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
