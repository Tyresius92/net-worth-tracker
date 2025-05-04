import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "react-router";

import { requireUser, requireUserId } from "~/session.server";

import type { Route } from "./+types/route";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

  return {
    userId
  };

};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireUser(request);

  const _formData = await request.formData();

  return {
    user,
  }
};

export default function LinkedAccountsIndex(_props: Route.ComponentProps) {

  return (
    <div>
      <h2>Linked Accounts</h2>
    </div>
  );
}
