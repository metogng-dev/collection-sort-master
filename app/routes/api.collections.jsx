import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(`
    query {
      collections(first: 50) {
        edges {
          node {
            id
            title
            handle
          }
        }
      }
    }
  `);

  const data = await response.json();

  const collections = data.data.collections.edges.map((edge) => edge.node);

  return Response.json({ collections });
}