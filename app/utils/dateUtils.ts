export const formatDate = (date: Date) => {
  const foo = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  });

  return foo.format(date);
};

export const getDateNDaysAgo = (daysAgo: number) => {
  const today = new Date();

  return new Date(new Date().setDate(today.getDate() - daysAgo));
};
