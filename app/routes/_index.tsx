import type { LoaderFunctionArgs, MetaFunction } from "react-router";

import { getUser } from "~/session.server";

import type { Route } from "./+types/_index";

export const meta: MetaFunction = () => [{ title: "Remix Notes" }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);

  return {
    user,
  };
};

export default function Index({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;

  return (
    <>
      <div>Hello world!</div>
      <pre>{JSON.stringify(user ?? {}, undefined, 2)}</pre>
    </>
  );
}
