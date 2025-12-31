
import {
  Link,
} from "react-router";

import { Box } from "~/components/Box/Box";


// TODO: Move this over to a separate "update" route that gets called on mount or something?
// Tbh, this whole flow is whack

export default function PlaidItemDetailsRoute() {
  return <Box>
    <Link to="./update">
      Fix the connection
    </Link>
  </Box>;
}
