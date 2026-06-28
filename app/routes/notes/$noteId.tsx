import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { redirect, Form, useLoaderData, useRouteError } from "react-router";
import invariant from "tiny-invariant";

import { Box } from "~/components/Box/Box";
import { Button } from "~/components/Button/Button";
import { deleteNote, getNote } from "~/models/note.server";
import { getUserId, loginRedirect } from "~/session.server";
import { HttpError } from "~/utils/httpError";

export const loader = async ({ params, request, url }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (!userId) return loginRedirect(url);
  invariant(params.noteId, "noteId not found");

  const note = await getNote({ id: params.noteId, userId });
  if (!note) {
    throw new HttpError("Not Found", 404);
  }
  return { note };
};

export const action = async ({ params, request, url }: ActionFunctionArgs) => {
  const userId = await getUserId(request);
  if (!userId) return loginRedirect(url);
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
        <Button type="submit">Delete</Button>
      </Form>
    </Box>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof HttpError && error.status === 404) {
    return <Box>Note not found</Box>;
  }

  if (error instanceof Error) {
    return <Box>An unexpected error occurred: {error.message}</Box>;
  }

  return <h1>Unknown Error</h1>;
}
