import { Box } from "~/components/Box/Box";

import jurassicParkGif from "./jurassic-park.gif";

export default function TrollTheAttackers() {
  return (
    <Box>
      <img
        src={jurassicParkGif}
        alt="Dennis Nedry from Jurassic Park wagging his finger. The words 'Ah ah ah. You didn't say the magic word' flash next to him"
      />
    </Box>
  );
}
