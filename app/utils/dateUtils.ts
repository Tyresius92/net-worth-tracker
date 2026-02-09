export const formatDate = (date: Date) => {
  const foo = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  });

  return foo.format(date);
};
