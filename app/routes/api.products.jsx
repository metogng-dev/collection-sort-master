import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);

  const url = new URL(request.url);

  const collectionId = url.searchParams.get("collectionId");

  const response = await admin.graphql(`
    query {
      collection(id: "${collectionId}") {
        products(first: 50) {
          edges {
            node {
              id
              title

              featuredImage {
                url
              }

              variants(first: 1) {
                edges {
                  node {
                    price
                    inventoryQuantity
                  }
                }
              }
            }
          }
        }
      }
    }
  `);

  const data = await response.json();

  const products =
    data.data.collection.products.edges.map((edge) => {
      const product = edge.node;

      const variant = product.variants.edges[0]?.node;

      return {
        id: product.id,
        title: product.title,
        image: product.featuredImage?.url || "",
        stock: variant?.inventoryQuantity || 0,
        price: variant?.price || 0,
      };
    });

  return Response.json({ products });
}