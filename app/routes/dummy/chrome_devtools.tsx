import path from "path";

export const loader = () => {
  if (process.env["NODE_ENV"] === "development") {
    const projectRoot = path.resolve();
    const jsonData = {
      workspace: {
        root: projectRoot,
        uuid: "my-uuid-xxx",
      },
    };
    return Response.json(jsonData);
  }

  return Response.json({});
};
