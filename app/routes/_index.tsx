import type { MetaFunction } from "react-router";

import { useOptionalUser } from "~/utils";

export const meta: MetaFunction = () => [{ title: "Remix Notes" }];

export default function Index() {
  const user = useOptionalUser();
  return (
    <>
      <div>Hello world!</div>
      <pre>{JSON.stringify(user ?? {}, undefined, 2)}</pre>
    </>
  );
}
