import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"

type OrderPlacedEvent = {
  id: string
}

export default async function orderPlacedHandler({
  event,
  container
}: SubscriberArgs<OrderPlacedEvent>) {
  const { id } = event.data
  const logger = container.resolve("logger") as any
  const query = container.resolve("query") as any
  
  logger.info(`Received order.placed event for order: ${id}`)

  try {
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "email",
        "shipping_address.*",
        "items.*",
        "items.variant.*",
      ],
      filters: {
        id: id,
      },
    })

    if (!orders || orders.length === 0) {
      logger.error(`Order with ID ${id} not found in Remote Query.`)
      return
    }

    const order = orders[0]
    const podItems: { productId?: string; variantId: string | number; quantity: number }[] = []

    for (const item of order.items || []) {
      const metadata = item.variant?.metadata || {}
      const podVariantId = metadata.pod_variant_id
      const podProductId = metadata.pod_product_id

      if (podVariantId) {
        podItems.push({
          productId: podProductId as string | undefined,
          variantId: podVariantId as string | number,
          quantity: item.quantity,
        })
      }
    }

    if (podItems.length === 0) {
      logger.info(`No Print-on-Demand items (having 'pod_variant_id' in metadata) found for order: ${id}`)
      return
    }

    logger.info(`Found ${podItems.length} Print-on-Demand items. Initializing fulfillment...`)
    
    // Resolve the Print-on-Demand service
    // Medusa v2 modules resolve their service from the container
    const podService = container.resolve("printOnDemandService") as any
    const address = order.shipping_address || {}

    await podService.createPODOrder(order.id, podItems, {
      firstName: address.first_name || "",
      lastName: address.last_name || "",
      address1: address.address_1 || "",
      address2: address.address_2 || "",
      city: address.city || "",
      province: address.province || "",
      postalCode: address.postal_code || "",
      countryCode: address.country_code || "",
      phone: address.phone || "",
      email: order.email || "",
    })

  } catch (error) {
    logger.error(`Error processing order.placed event for order ${id}: ${error instanceof Error ? error.message : error}`)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
