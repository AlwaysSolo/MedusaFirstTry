import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { linkSalesChannelsToStockLocationWorkflow, createInventoryLevelsWorkflow } from "@medusajs/medusa/core-flows";

export default async function fixInventory({ container }: { container: MedusaContainer }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const link = container.resolve(ContainerRegistrationKeys.LINK);

  logger.info("Starting fixInventory script...");

  // 1. Get all stock locations
  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"]
  });
  logger.info(`Found stock locations: ${JSON.stringify(stockLocations)}`);

  // 2. Get all sales channels
  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"]
  });
  logger.info(`Found sales channels: ${JSON.stringify(salesChannels)}`);

  // 3. Link each stock location to each sales channel
  for (const location of stockLocations) {
    for (const channel of salesChannels) {
      try {
        await linkSalesChannelsToStockLocationWorkflow(container).run({
          input: {
            id: location.id,
            add: [channel.id]
          }
        });
        logger.info(`Linked location ${location.id} to sales channel ${channel.id}`);
      } catch (err) {
        logger.warn(`Could not link ${location.id} to ${channel.id}: ${err.message}`);
      }
    }
  }

  // 4. Get inventory items
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "sku"]
  });
  logger.info(`Found inventory items: ${inventoryItems.length}`);

  // 5. Create inventory levels for all items and locations
  for (const item of inventoryItems) {
    for (const location of stockLocations) {
      try {
        await createInventoryLevelsWorkflow(container).run({
          input: {
            inventory_levels: [{
              location_id: location.id,
              stocked_quantity: 1000000,
              inventory_item_id: item.id
            }]
          }
        });
        logger.info(`Created inventory level for item ${item.sku || item.id} at location ${location.id}`);
      } catch (err) {
        // level might already exist
      }
    }
  }

  logger.info("fixInventory script complete!");
}
