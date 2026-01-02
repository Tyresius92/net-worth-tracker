import { Outlet } from "react-router";

import { Box } from "~/components/Box/Box";

export default function ProfileLayout() {
  return (
    <Box px={32}>
      <Outlet />
    </Box>
  );
}
