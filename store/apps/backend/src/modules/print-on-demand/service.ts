import { Logger } from "@medusajs/framework/types"

type PODItem = {
  productId?: string
  variantId: string | number
  quantity: number
}

type OrderAddress = {
  firstName: string
  lastName: string
  address1: string
  address2?: string
  city: string
  province: string
  postalCode: string
  countryCode: string
  phone?: string
  email: string
}

export default class PrintOnDemandService {
  protected logger_: Logger

  constructor({ logger }: { logger: Logger }) {
    this.logger_ = logger
  }

  async createPODOrder(externalOrderId: string, items: PODItem[], address: OrderAddress) {
    const provider = (process.env.POD_PROVIDER || "").toLowerCase().trim()
    const apiKey = process.env.POD_API_KEY
    const shopId = process.env.POD_SHOP_ID

    if (!apiKey) {
      this.logger_.warn("Print-On-Demand API Key (POD_API_KEY) is not configured in environment variables. Skipping fulfillment request.")
      return
    }

    if (items.length === 0) {
      this.logger_.info(`No Print-on-Demand items found for order ${externalOrderId}. Skipping POD order creation.`)
      return
    }

    if (provider === "printify") {
      if (!shopId) {
        this.logger_.error("Printify Shop ID (POD_SHOP_ID) is required but not configured.")
        return
      }
      return this.sendToPrintify(externalOrderId, items, address, apiKey, shopId)
    } else if (provider === "printful") {
      return this.sendToPrintful(externalOrderId, items, address, apiKey)
    } else {
      this.logger_.warn(`Unknown Print-on-Demand provider "${provider}". Supported values are "printify" or "printful".`)
    }
  }

  private async sendToPrintify(
    externalOrderId: string,
    items: PODItem[],
    address: OrderAddress,
    apiKey: string,
    shopId: string
  ) {
    const url = `https://api.printify.com/v1/shops/${shopId}/orders.json`
    
    // Printify expects variant_id to be a number (usually)
    const lineItems = items.map((item) => {
      const variantIdNum = typeof item.variantId === "string" ? parseInt(item.variantId, 10) : item.variantId
      return {
        product_id: item.productId,
        variant_id: isNaN(variantIdNum) ? item.variantId : variantIdNum,
        quantity: item.quantity
      }
    })

    const payload = {
      external_id: externalOrderId,
      label: `Medusa Order ${externalOrderId}`,
      line_items: lineItems,
      shipping_method: 1, // Default standard shipping
      send_shipping_notification: false,
      address_to: {
        first_name: address.firstName,
        last_name: address.lastName,
        email: address.email,
        phone: address.phone || "",
        country: address.countryCode.toUpperCase(),
        region: address.province || "",
        address1: address.address1,
        address2: address.address2 || "",
        city: address.city,
        zip: address.postalCode
      }
    }

    this.logger_.info(`Sending order ${externalOrderId} to Printify...`)
    
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        this.logger_.error(`Printify API returned an error: ${JSON.stringify(data)}`)
        return { success: false, error: data }
      }

      this.logger_.info(`Successfully created Printify order: ${data.id || data.external_id}`)
      return { success: true, data }
    } catch (error) {
      this.logger_.error(`Failed to submit order to Printify: ${error instanceof Error ? error.message : error}`)
      return { success: false, error }
    }
  }

  private async sendToPrintful(
    externalOrderId: string,
    items: PODItem[],
    address: OrderAddress,
    apiKey: string
  ) {
    const url = "https://api.printful.com/orders"
    
    // Printful sync_variant_id is a number (usually)
    const printfulItems = items.map((item) => {
      const variantIdNum = typeof item.variantId === "string" ? parseInt(item.variantId, 10) : item.variantId
      return {
        sync_variant_id: isNaN(variantIdNum) ? item.variantId : variantIdNum,
        quantity: item.quantity
      }
    })

    const payload = {
      external_id: externalOrderId,
      recipient: {
        name: `${address.firstName} ${address.lastName}`.trim(),
        address1: address.address1,
        address2: address.address2 || "",
        city: address.city,
        state_code: address.province || "",
        country_code: address.countryCode.toUpperCase(),
        zip: address.postalCode,
        phone: address.phone || "",
        email: address.email
      },
      items: printfulItems
    }

    this.logger_.info(`Sending order ${externalOrderId} to Printful...`)

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        this.logger_.error(`Printful API returned an error: ${JSON.stringify(data)}`)
        return { success: false, error: data }
      }

      this.logger_.info(`Successfully created Printful order: ${data.result?.id || data.external_id}`)
      return { success: true, data }
    } catch (error) {
      this.logger_.error(`Failed to submit order to Printful: ${error instanceof Error ? error.message : error}`)
      return { success: false, error }
    }
  }
}
