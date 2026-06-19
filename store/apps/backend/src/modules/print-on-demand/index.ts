import { Module } from "@medusajs/framework/utils"
import PrintOnDemandService from "./service"

export const PRINT_ON_DEMAND_MODULE = "printOnDemandService"

export default Module(PRINT_ON_DEMAND_MODULE, {
  service: PrintOnDemandService,
})
