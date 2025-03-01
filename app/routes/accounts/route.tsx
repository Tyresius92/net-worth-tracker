import { CountryCode, Products } from "plaid";
import { usePlaidLink } from "react-plaid-link";
import {
  ActionFunctionArgs,
  Link,
  LoaderFunctionArgs,
  useFetcher,
} from "react-router";

import { prisma } from "~/db.server";
import { plaidClient } from "~/plaid";
import { requireUserId } from "~/session.server";

import type { Route } from "./+types/route";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const userId = await requireUserId(request);

    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: userId,
      },
      client_name: "Net Worth Tracker",
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en",
    });

    const accounts = await prisma.account.findMany({
      select: {
        id: true,
        nickName: true,
        plaidAccountId: true,
        officialName: true,
        updatedAt: true,
      },
    });

    return {
      linkToken: response.data.link_token,
      accounts,
    };
  } catch {
    return {
      linkToken: "",
      accounts: [],
    };
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();

  const publicToken = formData.get("public_token");

  if (typeof publicToken !== "string") {
    return {};
  }

  const tokenResponse = await plaidClient.itemPublicTokenExchange({
    public_token: publicToken,
  });

  const accessToken = tokenResponse.data.access_token;
  const itemId = tokenResponse.data.item_id;

  const newItem = await prisma.plaidItem.create({
    data: {
      accessToken,
      plaidItemId: itemId,
      userId,
    },
  });

  const accountsGetResponse = await plaidClient.accountsGet({
    access_token: accessToken,
  });

  const accounts = accountsGetResponse.data.accounts;

  const plaidAccounts = await prisma.account.createManyAndReturn({
    data: accounts.map((account) => ({
      userId: userId,
      officialName: account.official_name ?? account.name,
      nickName: account.name,
      itemId: newItem.id,
      plaidAccountId: account.persistent_account_id ?? account.account_id,
    })),
  });

  plaidAccounts.forEach(async (acc) => {
    const accountDict = accounts.find(
      (account) =>
        (account.persistent_account_id ?? account.account_id) ===
        acc.plaidAccountId,
    );

    await prisma.accountBalance.create({
      data: {
        accountId: acc.id,
        snapshotDatetime: new Date(),
        amount: (accountDict?.balances.current ?? 0) * 100,
      },
    });
  });

  return { plaidItemId: newItem.id };
};

export default function LinkedAccountsIndex({
  loaderData,
}: Route.ComponentProps) {
  const fetcher = useFetcher();

  const { open, ready } = usePlaidLink({
    token: loaderData.linkToken,
    onSuccess: (public_token, _metadata) => {
      fetcher.submit({ public_token }, { method: "post", action: ".?index" });
    },
  });

  return (
    <div>
      <h2>Linked Accounts</h2>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
        }}
      >
        <button onClick={() => open()} disabled={!ready}>
          Link new account
        </button>
        <Link to="new">Add a new manual account</Link>
      </div>
      <div>
        <ul>
          {loaderData.accounts.map((account) => (
            <li
              key={account.id}
              style={{
                padding: 20,
                border: "1px solid black",
                borderRadius: 4,
                marginBlock: 10,
              }}
            >
              <Link to={account.id}>
                <div>
                  <h3>{account.nickName}</h3>
                  <p>Last updated: {account.updatedAt.toISOString()}</p>
                  <p>
                    Is Plaid Account? {account.plaidAccountId ? "Yes" : "No"}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
