import { ActionFunctionArgs, Form, LoaderFunctionArgs } from "react-router"

import { requireUserId } from "~/session.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUserId(request)

  return {}
}

export const action = async ({ request }: ActionFunctionArgs) => {
  await requireUserId(request)

  return {}
}

export default function NewBalanceRoute() {
  return <div>
    <h2>
      New Balance
    </h2>
    <Form method="post">

    </Form>
  </div>
}