import { decryptString, parseCloakedString } from "@47ng/cloak";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
  useFetcher,
} from "react-router";

import { Box } from "~/components/Box/Box";
import { Button } from "~/components/Button/Button";
import { Link } from "~/components/Link/Link";
import { Table } from "~/components/Table/Table";
import { prisma } from "~/db.server";
import { plaidClient } from "~/plaid";
import { requireUser } from "~/session.server";
import { formatDate } from "~/utils/dateUtils";

import type { Route } from "./+types/route";

export const computeSourceCounts = (
  accounts: {
    closedAt: Date | null;
    plaidAccount: { id: string } | null;
  }[],
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

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireUser(request);

  if (user.role !== "admin") {
    throw redirect("/", { status: 403 });
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "backfill_webhooks") {
    const plaidItems = await prisma.plaidItem.findMany({
      where: { status: "healthy" },
      select: { accessToken: true },
    });

    const results = await Promise.allSettled(
      plaidItems.map((item) =>
        plaidClient.itemWebhookUpdate({
          access_token: item.accessToken,
          webhook: `${process.env.APP_URL}/api/subscriptions/plaid`,
        }),
      ),
    );

    const failed = results.filter((r) => r.status === "rejected").length;
    return Response.json({ updated: results.length - failed, failed });
  }

  if (intent === "decrypt_plaid_item_ids") {
    const encryptionKey = process.env["PRISMA_FIELD_ENCRYPTION_KEY"];
    if (!encryptionKey) {
      return Response.json(
        { error: "PRISMA_FIELD_ENCRYPTION_KEY is not set" },
        { status: 500 },
      );
    }

    const rows = await prisma.$queryRaw<{ id: string; plaidItemId: string }[]>`
      SELECT id, plaidItemId FROM PlaidItem
    `;

    let decrypted = 0;
    let skipped = 0;

    await Promise.all(
      rows.map(async (row) => {
        if (!parseCloakedString(row.plaidItemId)) {
          skipped++;
          return;
        }

        const plainText = await decryptString(row.plaidItemId, encryptionKey);
        await prisma.$executeRaw`
          UPDATE PlaidItem SET plaidItemId = ${plainText} WHERE id = ${row.id}
        `;
        decrypted++;
      }),
    );

    return Response.json({ decrypted, skipped });
  }

  return Response.json({ ok: true });
};

interface BackfillResult {
  updated: number;
  failed: number;
}

const isBackfillResult = (value: unknown): value is BackfillResult =>
  typeof value === "object" &&
  value !== null &&
  "updated" in value &&
  typeof value.updated === "number" &&
  "failed" in value &&
  typeof value.failed === "number";

interface DecryptResult {
  decrypted: number;
  skipped: number;
}

const isDecryptResult = (value: unknown): value is DecryptResult =>
  typeof value === "object" &&
  value !== null &&
  "decrypted" in value &&
  typeof value.decrypted === "number" &&
  "skipped" in value &&
  typeof value.skipped === "number";

export default function Layout({ loaderData }: Route.ComponentProps) {
  const backfillFetcher = useFetcher();
  const decryptFetcher = useFetcher();
  const backfillResult = isBackfillResult(backfillFetcher.data)
    ? backfillFetcher.data
    : null;
  const decryptResult = isDecryptResult(decryptFetcher.data)
    ? decryptFetcher.data
    : null;

  return (
    <Box>
      <Box xsPb={8} display="flex" xsGap={8}>
        <backfillFetcher.Form method="post">
          <input type="hidden" name="intent" value="backfill_webhooks" />
          <Box display="flex" xsGap={4} alignItems="center">
            <Button
              type="submit"
              disabled={backfillFetcher.state !== "idle"}
            >
              {backfillFetcher.state !== "idle"
                ? "Registering…"
                : "Register Plaid Webhooks"}
            </Button>
            {backfillResult && (
              <span>
                Updated: {backfillResult.updated}, Failed:{" "}
                {backfillResult.failed}
              </span>
            )}
          </Box>
        </backfillFetcher.Form>
        <decryptFetcher.Form method="post">
          <input type="hidden" name="intent" value="decrypt_plaid_item_ids" />
          <Box display="flex" xsGap={4} alignItems="center">
            <Button
              type="submit"
              disabled={decryptFetcher.state !== "idle"}
            >
              {decryptFetcher.state !== "idle"
                ? "Decrypting…"
                : "Decrypt Plaid Item IDs"}
            </Button>
            {decryptResult && (
              <span>
                Decrypted: {decryptResult.decrypted}, Skipped:{" "}
                {decryptResult.skipped}
              </span>
            )}
          </Box>
        </decryptFetcher.Form>
      </Box>
      <Table caption="Users">
        <Table.Head>
          <Table.ColumnHeader>Full Name</Table.ColumnHeader>
          <Table.ColumnHeader>First Name</Table.ColumnHeader>
          <Table.ColumnHeader>Last Name</Table.ColumnHeader>
          <Table.ColumnHeader>Email</Table.ColumnHeader>
          <Table.ColumnHeader>Verified At</Table.ColumnHeader>
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
                <Table.Cell>
                  {user.emailVerifiedAt
                    ? formatDate(user.emailVerifiedAt)
                    : "N/A"}
                </Table.Cell>
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
