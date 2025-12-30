import { LoaderFunctionArgs } from "react-router";

import { Box } from "~/components/Box/Box";
import { Link } from "~/components/Link/Link";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

import { Route } from "./+types/route";


export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

  const plaidItems = await prisma.plaidItem.findMany({
    where: {
      userId
    },
    select: {
      id: true,
      institutionName: true,
    }
  })

  return {
    plaidItems
  }
}

export default function PlaidItemIndexRoute({ loaderData }: Route.ComponentProps) {
  return <Box>
    <Box>Plaid Items</Box>
    <Box>
      {loaderData.plaidItems.map(item => (
        <Box key={item.id}>
          <Link to={`./${item.id}`}>
            {item.institutionName}
          </Link>
        </Box>
      ))}
    </Box>
  </Box>;
}
