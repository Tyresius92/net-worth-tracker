// TEMPORARY: one-off tool to purge spam users. Delete this route (and its
// entry in app/routes.ts) once the purge has been run.
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, redirect, useNavigation } from "react-router";

import { Box } from "~/components/Box/Box";
import { Button } from "~/components/Button/Button";
import { Heading } from "~/components/Heading/Heading";
import { Link } from "~/components/Link/Link";
import { Text } from "~/components/Text/Text";
import { prisma } from "~/db.server";
import { getUser, loginRedirect } from "~/session.server";

import type { Route } from "./+types/route";

// Users eligible for deletion: everyone except the current admin, any admin,
// and anyone with a Plaid item (deleting those rows would leave the item live
// at Plaid).
const purgeableWhere = (currentUserId: string) => ({
  id: { not: currentUserId },
  role: { not: "admin" as const },
  plaidItems: { none: {} },
});

export const loader = async ({ request, url }: LoaderFunctionArgs) => {
  const currentUser = await getUser(request);
  if (!currentUser) {
    return loginRedirect(url);
  }
  if (currentUser.role !== "admin") {
    return redirect("/");
  }

  const [purgeableCount, skippedWithPlaid] = await Promise.all([
    prisma.user.count({ where: purgeableWhere(currentUser.id) }),
    prisma.user.findMany({
      where: {
        id: { not: currentUser.id },
        role: { not: "admin" },
        plaidItems: { some: {} },
      },
      select: { id: true, email: true },
    }),
  ]);

  return {
    currentUserEmail: currentUser.email,
    purgeableCount,
    skippedWithPlaid,
  };
};

export const action = async ({ request, url }: ActionFunctionArgs) => {
  const currentUser = await getUser(request);
  if (!currentUser) {
    return loginRedirect(url);
  }
  if (currentUser.role !== "admin") {
    return redirect("/");
  }

  await prisma.user.deleteMany({ where: purgeableWhere(currentUser.id) });

  return redirect("/users");
};

export default function PurgeUsersPage({ loaderData }: Route.ComponentProps) {
  const { currentUserEmail, purgeableCount, skippedWithPlaid } = loaderData;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Box xsP={24}>
      <Heading level={1}>Purge users</Heading>

      <Box xsMt={16}>
        <Text>Kept: you ({currentUserEmail}) and any admin.</Text>
      </Box>

      {skippedWithPlaid.length > 0 ? (
        <Box xsMt={16}>
          <Text>
            Skipped (has wire services — handle by hand):{" "}
            {skippedWithPlaid.map((user) => user.email).join(", ")}
          </Text>
        </Box>
      ) : null}

      <Box xsMt={16}>
        <Text>
          {purgeableCount} users will be permanently deleted, along with their
          sources, figures, and notes.
        </Text>
      </Box>

      <Form method="post">
        <Box display="flex" flexDirection="column" xsGap={12} xsMt={24}>
          <Button
            type="submit"
            variant="danger"
            disabled={purgeableCount === 0 || isSubmitting}
          >
            {isSubmitting ? "Deleting…" : `Delete ${purgeableCount} users`}
          </Button>
          <Link to="/users">Cancel</Link>
        </Box>
      </Form>
    </Box>
  );
}
