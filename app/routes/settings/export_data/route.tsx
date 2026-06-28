import type { LoaderFunctionArgs } from "react-router";

import { prisma } from "~/db.server";
import { getUser, loginRedirect } from "~/session.server";
import { formatDateUTC } from "~/utils/balanceUtils";
import { buildCSV } from "~/utils/exportUtils.server";

export const loader = async ({ request, url }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  if (!user) return loginRedirect(url);

  const accounts = await prisma.account.findMany({
    where: { userId: user.id },
    include: {
      balanceSnapshots: {
        select: { amount: true, date: true },
        orderBy: { dateTime: "asc" },
      },
      plaidAccount: {
        select: { name: true, officialName: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const csv = buildCSV(accounts);
  const today = formatDateUTC(new Date());

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="net-worth-${today}.csv"`,
    },
  });
};
