import { Outlet } from "react-router";

import { Box } from "~/components/Box/Box";

export default function AuthenticatedLayout() {
  return (
    <Box px={24}>
      <Outlet />
    </Box>
  );
}
