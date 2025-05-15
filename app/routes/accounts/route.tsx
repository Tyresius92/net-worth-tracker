import { Link, LoaderFunctionArgs } from "react-router";

import { Table } from "~/components/Table/Table";
import { getAccountsForUserId } from "~/models/account.server";
import { requireUser } from "~/session.server";

import type { Route } from "./+types/route";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);

  const accounts = await getAccountsForUserId(user.id);

  return {
    user,
    accounts,
  };
};

export default function LinkedAccountsIndex({
  loaderData,
}: Route.ComponentProps) {
  return (
    <div>
      <h2>{loaderData.user.firstName}&apos;s Linked Accounts</h2>
      <div>
        <Link to="new">Create Account</Link>
      </div>
      <div>
        <Table caption="Accounts">
          <Table.Head>
            <Table.ColumnHeader>ID</Table.ColumnHeader>
            <Table.ColumnHeader>NickName</Table.ColumnHeader>
          </Table.Head>
          <Table.Body>
            {loaderData.accounts.map((account) => (
              <Table.Row key={account.id}>
                <Table.Cell>
                  <Link to={account.id}>{account.id}</Link>
                </Table.Cell>
                <Table.Cell>{account.nickName}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}
