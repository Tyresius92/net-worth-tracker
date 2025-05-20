import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import {
  redirect,
  Form,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "react-router";
import invariant from "tiny-invariant";
import { Box } from "~/components/Box/Box";

import { deleteNote, getNote } from "~/models/note.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.noteId, "noteId not found");

  const note = await getNote({ id: params.noteId, userId });
  if (!note) {
    throw new Response("Not Found", { status: 404 });
  }
  return { note };
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.noteId, "noteId not found");

  await deleteNote({ id: params.noteId, userId });

  return redirect("/notes");
};

export default function NoteDetailsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <Box>
      <h3>{data.note.title}</h3>
      <p>{data.note.body}</p>
      <hr />
      <Form method="post">
        <button type="submit">Delete</button>
      </Form>
    </Box>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return <Box>An unexpected error occurred: {error.message}</Box>;
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>;
  }

  if (error.status === 404) {
    return <Box>Note not found</Box>;
  }

  return <Box>An unexpected error occurred: {error.statusText}</Box>;
}
