export function format(data: string | string[]) {
  if (Array.isArray(data)) {
    return data.map((el) => {
      return el.includes(",") ? `"${el}"` : el;
    });
  } else {
    return data.includes(",") ? `"${data}"` : data;
  }
}