import type { LoaderFunctionArgs } from "react-router";

import { Box } from "~/components/Box/Box";
import { Link } from "~/components/Link/Link";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

import type { Route } from "./+types/route";

export const loader = async ({ request, url }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request, url);

  const plaidItems = await prisma.plaidItem.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      institutionName: true,
    },
  });

  return {
    plaidItems,
  };
};

export default function PlaidItemIndexRoute({
  loaderData,
}: Route.ComponentProps) {
  return (
    <Box>
      <Box>Wire services</Box>
      <Box>
        {loaderData.plaidItems.map((item) => (
          <Box key={item.id}>
            <Link to={`./${item.id}`}>{item.institutionName}</Link>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
