import { LoaderFunctionArgs, redirect } from "react-router";

import { Box } from "~/components/Box/Box";
import { Link } from "~/components/Link/Link";
import { Table } from "~/components/Table/Table";
import { prisma } from "~/db.server";
import { requireUser } from "~/session.server";

import type { Route } from "./+types/route";

export const computeSourceCounts = (
  accounts: Array<{
    closedAt: Date | null;
    plaidAccount: { id: string } | null;
  }>,
) => {
  const active = accounts.filter((a) => !a.closedAt);
  const wireSources = active.filter((a) => a.plaidAccount !== null).length;
  return {
    wireSources,
    staffReportedSources: active.length - wireSources,
    closedSources: accounts.length - active.length,
  };
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);

  if (user.role !== "admin") {
    throw redirect("/", { status: 403 });
  }

  const rawUsers = await prisma.user.findMany({
    include: {
      accounts: {
        select: {
          closedAt: true,
          plaidAccount: { select: { id: true } },
        },
      },
    },
  });

  const users = rawUsers.map(({ accounts, ...user }) => ({
    ...user,
    ...computeSourceCounts(accounts),
  }));

  return { users };
};

export default function Layout({ loaderData }: Route.ComponentProps) {
  return (
    <Box>
      <Table caption="Users">
        <Table.Head>
          <Table.ColumnHeader>Full Name</Table.ColumnHeader>
          <Table.ColumnHeader>First Name</Table.ColumnHeader>
          <Table.ColumnHeader>Last Name</Table.ColumnHeader>
          <Table.ColumnHeader>Email</Table.ColumnHeader>
          <Table.ColumnHeader>Role</Table.ColumnHeader>
          <Table.ColumnHeader>2FA</Table.ColumnHeader>
          <Table.ColumnHeader>Sources</Table.ColumnHeader>
          <Table.ColumnHeader>Closed</Table.ColumnHeader>
          <Table.ColumnHeader>Actions</Table.ColumnHeader>
        </Table.Head>
        <Table.Body>
          {(loaderData.users ?? []).map((user) => {
            const totalActive = user.wireSources + user.staffReportedSources;
            const sourcesLabel =
              totalActive === 0
                ? "—"
                : `${totalActive} — ${user.wireSources} wire · ${user.staffReportedSources} staff-reported`;
            return (
              <Table.Row key={user.id}>
                <Table.Cell>
                  <Link to={`./${user.id}`}>{user.fullName}</Link>
                </Table.Cell>
                <Table.Cell>{user.firstName}</Table.Cell>
                <Table.Cell>{user.lastName}</Table.Cell>
                <Table.Cell>{user.email}</Table.Cell>
                <Table.Cell>{user.role}</Table.Cell>
                <Table.Cell>
                  {user.twoFactorEnabled ? "Enabled" : "Disabled"}
                </Table.Cell>
                <Table.Cell>{sourcesLabel}</Table.Cell>
                <Table.Cell>
                  {user.closedSources === 0 ? "—" : user.closedSources}
                </Table.Cell>
                <Table.Cell>
                  <Link to={`/users/${user.id}`}>View</Link>
                  {" · "}
                  <Link to={`/users/${user.id}/delete`}>Delete</Link>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </Box>
  );
}
