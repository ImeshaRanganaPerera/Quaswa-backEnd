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
import { userCenterRoute } from "./components/userCenter/userCenter.router";
import { inventoryRouter } from "./components/inventory/inventory.router";
import { VoucherProductListRouter } from "./components/voucherProduct/voucherProduct.router";
import { chartofAccRouter } from "./components/ChartofAccount/chartofaccount.router";
import { accCategoryRouter } from "./components/accountCategory/accountCategory.router";
import { accSubCategoryRouter } from "./components/accountSubCategory/accountSubCategory.router";
import { accGroupRouter } from "./components/accountGroup/accountGroup.router";
import { partyCategoryRouter } from "./components/partyCategory/partyCategory.route";
import { chequebookRoute } from "./components/ChequeBook/chequebook.router";


dotenv.config();

if (!process.env.PORT) {
    process.exit(1);
}

const PORT: number = parseInt(process.env.PORT as string, 10);

const app = express();

app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

app.use(cors());
app.use(express.json());
app.use("/api/users", userRouter)
app.use("/api/center", centerRouter)
app.use("/api/party", partyRouter)
app.use("/api/partyCategory", partyCategoryRouter)
app.use("/api/brand", brandRouter)
app.use("/api/type", typeRouter)
app.use("/api/product", productRouter)
app.use("/api/voucher", voucherRouter)
app.use("/api/userCenter", userCenterRoute)
app.use("/api/inventory", inventoryRouter)
app.use("/api/voucherProduct", VoucherProductListRouter)
app.use("/api/chartofAcc", chartofAccRouter)
app.use("/api/accSubCategory", accSubCategoryRouter)
app.use("/api/accGroup", accGroupRouter)
app.use("/api/accCategory", accCategoryRouter)
app.use("/api/chequebook", chequebookRoute)

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
