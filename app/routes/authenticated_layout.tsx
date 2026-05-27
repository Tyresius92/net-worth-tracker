import { Outlet } from "react-router";

import { Box } from "~/components/Box/Box";

export default function AuthenticatedLayout() {
  return (
    <Box xsPx={24}>
      <Outlet />
    </Box>
  );
}
