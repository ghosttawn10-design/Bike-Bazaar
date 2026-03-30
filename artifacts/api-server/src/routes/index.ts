import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import requestsRouter from "./requests";
import adminRouter from "./admin";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/products", productsRouter);
router.use("/requests", requestsRouter);
router.use("/admin", adminRouter);
router.use("/stats", statsRouter);

export default router;
