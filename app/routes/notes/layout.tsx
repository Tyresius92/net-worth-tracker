import type { LoaderFunctionArgs } from "react-router";
import { Form, NavLink, Outlet, useLoaderData } from "react-router";

import { Box } from "~/components/Box/Box";
import { Button } from "~/components/Button/Button";
import { Link } from "~/components/Link/Link";
import { getNoteListItems } from "~/models/note.server";
import { getUserId, loginRedirect } from "~/session.server";
import { useUser } from "~/utils";

export const loader = async ({ request, url }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (!userId) return loginRedirect(url);
  const noteListItems = await getNoteListItems({ userId });
  return { noteListItems };
};

export default function NotesPage() {
  const data = useLoaderData<typeof loader>();
  const user = useUser();

  return (
    <Box>
      <header>
        <h1>
          <Link to=".">Notes</Link>
        </h1>
        <p>{user.email}</p>
        <Form action="/logout" method="post">
          <Button type="submit">Logout</Button>
        </Form>
      </header>

      <>
        <Box>
          <Link to="new">+ New Note</Link>

          <hr />

          {data.noteListItems.length === 0 ? (
            <p>No notes yet</p>
          ) : (
            <ol>
              {data.noteListItems.map((note) => (
                <li key={note.id}>
                  <NavLink to={note.id}>📝 {note.title}</NavLink>
                </li>
              ))}
            </ol>
          )}
        </Box>

        <Box>
          <Outlet />
        </Box>
      </>
    </Box>
  );
}
