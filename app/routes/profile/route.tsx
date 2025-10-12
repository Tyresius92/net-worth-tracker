import { LoaderFunctionArgs } from "react-router";

import { Box } from "~/components/Box/Box";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

import type { Route } from "./+types/route";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

  const user = await prisma.user.findFirstOrThrow({
    where: {
      id: userId
    },
  })


  return {
    user,
  };
};

export default function ProfilePage({ loaderData }: Route.ComponentProps) {
  return (
    <Box>
      <h1>{loaderData.user.fullName}&apos;s Profile</h1>
    </Box>
  );
}
