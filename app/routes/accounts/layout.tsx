import { LoaderFunctionArgs, Outlet } from "react-router";

import { Link } from "~/components/Link/Link";
import { getAccountsForUserId } from "~/models/account.server";
import { requireUserId } from "~/session.server";

import type { Route } from "./+types/layout";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request)

  const accounts = await getAccountsForUserId(userId)

  return {
    accounts
  }
}

export default function LinkedAccountsLayout({ loaderData }: Route.ComponentProps) {
  return (
    <div style={{
      display: 'flex',
      gap: 'var(--space-32)'
    }}>
      <nav>
        <ul>
          {loaderData.accounts.map(account => (
            <li key={account.id}>
              <Link to={account.id}>
                {account.nickName}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div>
        <Outlet />
      </div>
    </div>
  )
}
