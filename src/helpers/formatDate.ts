export const formatDate = (dateString: string) => {
  const dateObject = new Date(dateString);
  const formattedDate = dateObject.toString().split(" GMT")[0];
  return formattedDate;
};
