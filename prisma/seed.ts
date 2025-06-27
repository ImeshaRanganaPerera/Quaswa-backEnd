import { role, inventoryMode } from "@prisma/client";
import { db } from "../src/utils/db.server"
import { format, toZonedTime } from 'date-fns-tz';
import { hash } from "bcrypt";

async function seed() {
    const currentDateTime = new Date();
    const timezone = 'Asia/Colombo';

    const utcDateTime = format(toZonedTime(currentDateTime, timezone), 'yyyy-MM-dd HH:mm:ss.SSSXXX', { timeZone: 'UTC' });
    const hashedPassword = await hash("1234", 10);
    const user = await db.user.create({
        data: {
            name: "Admin",
            phoneNumber: "0000000000",  // Example phone number
            username: "admin",
            password: hashedPassword,
            role: role.ADMIN,  // Using the Role enum
            isconform: true
        }});
    const userid = user.id;

    const CompanyDetails = await db.companyDetails.create({
        data: {
            companyName: "HITECH (PVT) LTD",
            address1: "Colombo",
            address2: "Sri Lanka",
            telPhone1: "0764533003",
            telPhone2: "0729451231",
            email: 'info@hitechlanka.lk',
        }
    })

    const customer = await db.partyGroup.create({
        data: { partyGroupName: "CUSTOMER" }
    })

    const supplier = await db.partyGroup.create({
        data: { partyGroupName: "SUPPLIER" }
    })

    await db.partyCategory.createMany({
        data: [
            { category: "WALKING CUSTOMER", partyGroupId: customer.id, createdBy: userid },
            { category: "VISITING CUSTOMER", partyGroupId: customer.id, isEditable: false, createdBy: userid },
            { category: "COMMON SUPPLIER", partyGroupId: supplier.id, createdBy: userid }
        ]
    })

    await db.discountLevel.create({
        data: { level: 'Cash Discount', createdBy: userid }
    })

    await db.brand.createMany({
        data: [
            { brandName: "BMW", createdBy: userid },
            { brandName: "TATA", createdBy: userid },
            { brandName: "TOYOTA", createdBy: userid },
        ]
    });

    await db.type.createMany({
        data: [
            { typeName: "OIL FILTER", createdBy: userid },
            { typeName: "RIM", createdBy: userid },
            { typeName: "BUFFER", createdBy: userid },
        ]
    });

    await db.payment.createMany({
        data: [
            { type: "Cash" },
            { type: "Online Transfer" },
            { type: "Cheque" },
            { type: "Credit" },
            { type: "Petty Cash" },
            { type: "Advance" },
        ]
    });

    const assets = await db.accountCategory.create({
        data:
            { accCategory: "ASSETS" },
    });

    const liabilities = await db.accountCategory.create({
        data:
            { accCategory: "LIABILITIES" },
    });

    const equity = await db.accountCategory.create({
        data:
            { accCategory: "EQUITY" },
    });

    const income = await db.accountCategory.create({
        data:
            { accCategory: "INCOME" },
    });

    const expencess = await db.accountCategory.create({
        data:
            { accCategory: "EXPENSES" },
    });

    const fixassets = await db.accountSubCategory.create({
        data: { accountSubName: "FIX ASSETS", accountCategoryId: assets.id, createdBy: userid },
    })

    const currentassets = await db.accountSubCategory.create({
        data: { accountSubName: "CURRENT ASSETS", accountCategoryId: assets.id, createdBy: userid }
    })

    const fixliabilities = await db.accountSubCategory.create({
        data: { accountSubName: "FIX LIABILITIES", accountCategoryId: liabilities.id, createdBy: userid },
    })
    const currentLiabilites = await db.accountSubCategory.create({
        data: { accountSubName: "CURRENT LIABILITIES", accountCategoryId: liabilities.id, createdBy: userid },
    })
    const Expencess = await db.accountSubCategory.create({
        data: { accountSubName: "Expenses", accountCategoryId: expencess.id, createdBy: userid },
    })

    const Incomes = await db.accountSubCategory.create({
        data: { accountSubName: "Income", accountCategoryId: income.id, createdBy: userid },
    })

    const cash = await db.accountGroup.create({
        data: { accountGroupName: 'Cash & Cash Equivalents', createdBy: userid }
    })

    const bank = await db.accountGroup.create({
        data: { accountGroupName: 'Bank', createdBy: userid }
    })

    const receivable = await db.accountGroup.create({
        data: { accountGroupName: 'Receivable', createdBy: userid }
    })

    const payable = await db.accountGroup.create({
        data: { accountGroupName: 'Payable', createdBy: userid }
    })

    const acexpencess = await db.accountGroup.create({
        data: { accountGroupName: 'Expenses', createdBy: userid }
    })

    const incomes = await db.accountGroup.create({
        data: { accountGroupName: 'Income', createdBy: userid }
    })

    const inventory = await db.accountGroup.create({
        data: { accountGroupName: 'Inventory', createdBy: userid }
    })

    const inventorys = await db.chartofAccount.create({
        data: { accountName: "INVENTORY ACCOUNT", accountSubCategoryId: currentassets.id, accountGroupId: inventory.id, Opening_Balance: 0, createdBy: userid },
    })

    await db.chartofAccount.createMany({
        data: [
            { accountName: "EXPENSES ACCOUNT", accountSubCategoryId: Expencess.id, accountGroupId: acexpencess.id, Opening_Balance: 0, createdBy: userid },
          //  { accountName: "PURCHASE EXPENCESS", accountSubCategoryId: Expencess.id, accountGroupId: acexpencess.id, Opening_Balance: 0, createdBy: userid },
            { accountName: "SALES REVENUE", accountSubCategoryId: Incomes.id, accountGroupId: incomes.id, Opening_Balance: 0, createdBy: userid },
            { accountName: "OPERATIONAL EXPENSES ACCOUNT", accountSubCategoryId: Expencess.id, accountGroupId: acexpencess.id, Opening_Balance: 0, createdBy: userid },
            { accountName: "MAIN CASH BOOK", accountSubCategoryId: currentassets.id, accountGroupId: cash.id, Opening_Balance: 0, createdBy: userid },
            { accountName: "PETTY CASH BOOK", accountSubCategoryId: currentassets.id, accountGroupId: cash.id, Opening_Balance: 0, createdBy: userid },
            { accountName: "CHEQUES RECEIVED - PENDING CLEARANCE", accountSubCategoryId: currentassets.id, accountGroupId: cash.id, Opening_Balance: 0, createdBy: userid },
            { accountName: "INVENTORY", accountSubCategoryId: currentassets.id, accountGroupId: inventory.id, Opening_Balance: 0, createdBy: userid },
            { accountName: "IMPORT CLEARING ACCOUNT", accountSubCategoryId: currentLiabilites.id, accountGroupId: payable.id, Opening_Balance: 0, createdBy: userid },
            { accountName: "COST OF GOODS SOLD", accountSubCategoryId: Expencess.id, accountGroupId: acexpencess.id, Opening_Balance: 0, createdBy: userid },
        ]
    })

    await db.voucherGroup.createMany({
        data: [
            { voucherName: "INVOICE", shortname: "INV", inventoryMode: inventoryMode.MINUS, isAccount: true, isSidemenu: true, category: "Sales", label: "Invoice" },
            { voucherName: "SALES-RETURN", shortname: "SRET", inventoryMode: inventoryMode.PLUS, isAccount: true, isSidemenu: true, category: "Sales", label: "Sales Return" },
            { voucherName: "SALES-ORDER", shortname: "SO", inventoryMode: inventoryMode.NONE, isAccount: false, isSidemenu: true, category: "Sales", label: "Sales Order" },
            { voucherName: "GRN", shortname: "GRN", inventoryMode: inventoryMode.PLUS, isAccount: true, isSidemenu: true, category: "Inventory", label: "GRN" },
            { voucherName: "PURCHASE-RETURN", shortname: "PRT", inventoryMode: inventoryMode.MINUS, isAccount: true, isSidemenu: true, category: "Inventory", label: "Purchase Return" },
            { voucherName: "STOCK-TRANSFER", shortname: "ST", inventoryMode: inventoryMode.DOUBLE, isAccount: false, isSidemenu: true, category: "Inventory", label: "Stock Transfer" },
            { voucherName: "PURCHASE-ORDER", shortname: "PO", inventoryMode: inventoryMode.NONE, isAccount: false, isSidemenu: true, category: "Inventory", label: "Purchase Order" },
            { voucherName: "PAYMENT", shortname: "PAYMENT", inventoryMode: inventoryMode.NONE, isAccount: true, isSidemenu: true, category: "Account", label: "Payment" },
            { voucherName: "DIRECT PAYMENT", shortname: "PAYMENT-D", inventoryMode: inventoryMode.NONE, isAccount: true, isSidemenu: true, category: "Account", label: "Direct Payment" },
            { voucherName: "RECEIPT", shortname: "RECEIPT", inventoryMode: inventoryMode.NONE, isAccount: true, isSidemenu: true, category: "Account", label: "Recipt" },
            { voucherName: "UTILITY-BILL-CREATE", shortname: "UTILITY-BC", inventoryMode: inventoryMode.NONE, isAccount: true, isSidemenu: true, category: "Account", label: "Utility Bill Create" },
            { voucherName: "UTILITY-BILL-PAYMENT", shortname: "UTILITY-BPAY", inventoryMode: inventoryMode.NONE, isAccount: true, isSidemenu: true, category: "Account", label: "Utility Bill Payment" },
            { voucherName: "PETTY-CASH", shortname: "PC", inventoryMode: inventoryMode.NONE, isAccount: true, isSidemenu: true, category: "Account", label: "Petty Cash" },
            { voucherName: "PETTY-CASH-IOU", shortname: "PC-IOU", inventoryMode: inventoryMode.NONE, isAccount: true, isSidemenu: true, category: "Account", label: "Petty Cash IOU" },
            { voucherName: "SUPPLIER-BILL", shortname: "SUPPLIER-BC", inventoryMode: inventoryMode.NONE, isAccount: true, isSidemenu: true, category: "Account", label: "Supplier Bill" },
            { voucherName: "JOURNAL-ENTRY", shortname: "JE", inventoryMode: inventoryMode.NONE, isAccount: true, isSidemenu: true, category: "Account", label: "Journal Entry" },
            { voucherName: "MAKE-DEPOSIT", shortname: "MD", inventoryMode: inventoryMode.NONE, isAccount: true, isSidemenu: true, category: "Account", label: "Make Deposit" },
            { voucherName: "ADVANCE-PAYMENT", shortname: "ADPAY", inventoryMode: inventoryMode.NONE, isAccount: true, isSidemenu: true, category: "Account", label: "Make Deposit" },
            { voucherName: "BANK-RECONCILIATION", shortname: "BR", inventoryMode: inventoryMode.NONE, isAccount: false, isSidemenu: true, category: "Account", label: "Bank Reconciliation" },
        ]
    });

}

seed().catch((error) => {
    console.error("Error seeding data:", error);
}).finally(async () => {
    await db.$disconnect();
});